#!/usr/bin/env python3
"""Easycode-scoped Coolify 4.6 backup pairs; run on the controller, never in the website."""
import argparse
import datetime
import json
import os
import re
import signal
import subprocess
import time
import uuid
from pathlib import Path

EXPECTED_MOUNT = "3e8d94be-3910-4b03-8017-e2b02742ff6f"
TERMINAL = {"success", "failed", "error", "cancelled", "canceled"}


def validate(config):
    for key in ("project", "server", "backend", "database_plan", "coordinator"):
        if not re.fullmatch(r"[a-z0-9]{20,32}", config.get(key, "")):
            raise ValueError("Invalid fixed resource mapping")
    if not config.get("file_plans") or any(
        not re.fullmatch(r"[a-z0-9]{20,32}", plan)
        for plan in [*config["file_plans"], *config.get("coordinator_file_plans", [])]
    ):
        raise ValueError("Missing fixed file backup plans")


def php(config, action, extra=None):
    # Mapping validation happens again inside Coolify before every remote action.
    payload = json.dumps({"config": {k: config[k] for k in
                        ("project", "server", "backend", "database_plan", "file_plans", "coordinator")},
                          "coordinator_file_plans": config.get("coordinator_file_plans", []),
                          "action": action, "extra": extra or {}})
    literal = json.dumps(payload)
    source = r'''<?php
require '/var/www/html/vendor/autoload.php';
$app=require '/var/www/html/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$input=json_decode(PAYLOAD,true);$c=$input['config'];$x=$input['extra'];
$a=App\Models\Application::where('uuid',$c['backend'])->firstOrFail();
if($a->environment->project->uuid!==$c['project']||$a->destination->server->uuid!==$c['server'])throw new Exception('Scope mismatch');
$db=App\Models\ScheduledDatabaseBackup::where('uuid',$c['database_plan'])->firstOrFail();
if($db->database->environment->project->uuid!==$c['project']||$db->database->destination->server->uuid!==$c['server'])throw new Exception('Database scope mismatch');
$co=App\Models\Application::where('uuid',$c['coordinator'])->firstOrFail();
if($co->environment->project->uuid!==$c['project']||$co->destination->server->uuid!==$c['server'])throw new Exception('Coordinator scope mismatch');
$plans=[$db];foreach($c['file_plans'] as $id){
 $p=App\Models\ScheduledVolumeBackup::forApplication($a)->where('uuid',$id)->firstOrFail();$plans[]=$p;
}
foreach($input['coordinator_file_plans'] as $id){
 $p=App\Models\ScheduledVolumeBackup::forApplication($co)->where('uuid',$id)->firstOrFail();$plans[]=$p;
}
foreach($plans as $p)if($p->enabled)throw new Exception('Independent native timer must remain disabled');
$server=$a->destination->server;$out=null;
if($input['action']==='mount'){
 $out=trim(instant_remote_process(['findmnt --noheadings --output UUID --mountpoint /data/coolify/backups'],$server));
}elseif($input['action']==='containers'){
 $out=trim(instant_remote_process(['docker ps --filter '.escapeshellarg('label=coolify.applicationUuid='.$a->uuid).' --format '.escapeshellarg('{{.ID}}')],$server));
}elseif(in_array($input['action'],['pause','unpause','image','paused'],true)){
 $id=$x['container'];if(!preg_match('/^[a-f0-9]{12,64}$/',$id))throw new Exception('Invalid container');
 $check=trim(instant_remote_process(['docker inspect --format '.escapeshellarg('{{index .Config.Labels "coolify.applicationUuid"}}').' '.escapeshellarg($id)],$server));
 if($check!==$a->uuid)throw new Exception('Container scope mismatch');
 if($input['action']==='paused'){
  $command='docker inspect --format '.escapeshellarg('{{.State.Paused}}').' '.escapeshellarg($id);
 }elseif($input['action']==='unpause'){
  $command='if [ "$(docker inspect --format '.escapeshellarg('{{.State.Paused}}').' '.escapeshellarg($id).')" = true ]; then docker unpause '.escapeshellarg($id).'; fi';
 }else{
  $command=($input['action']==='image'?'docker inspect --format '.escapeshellarg('{{.Image}}').' ':'docker pause ').escapeshellarg($id);
 }
 $out=trim(instant_remote_process([$command],$server));
}elseif($input['action']==='coordinator'){
 $target=$x['target'];$operation=$x['operation'];
 if($target!=='production-website'||!in_array($operation,['status','pause','resume'],true))throw new Exception('Invalid backup coordination operation');
 $ids=trim(instant_remote_process(['docker ps --filter '.escapeshellarg('label=coolify.applicationUuid='.$co->uuid).' --format '.escapeshellarg('{{.ID}}')],$server));
 if(!preg_match('/^[a-f0-9]{12,64}$/',$ids))throw new Exception('Expected one project coordinator');
 // Credentials stay inside their intended coordinator container. Only the
 // sanitized status result crosses the boundary; no key is copied or persisted.
 $js='const target='.json_encode($target).';const op='.json_encode($operation).';fetch("http://127.0.0.1:8080/v1/"+op+"/"+target,{method:"POST",headers:{Authorization:"Bearer "+process.env.EASYCODE_OPERATIONS_TOKEN,"Content-Type":"application/json"},body:"{}"}).then(async r=>{if(!r.ok)throw Error("Coordination failed");process.stdout.write(JSON.stringify(await r.json()))}).catch(()=>process.exit(1));';
 $raw=instant_remote_process(['docker exec '.escapeshellarg($ids).' node -e '.escapeshellarg($js)],$server);
 $out=json_decode($raw,true,512,JSON_THROW_ON_ERROR);
}elseif(in_array($input['action'],['dispatch','status'],true)){
 $p=collect($plans)->first(fn($p)=>$p->uuid===($x['plan']??''));if(!$p)throw new Exception('Unknown fixed plan');
 if($input['action']==='dispatch'){
  if($p->executions()->whereIn('status',['running','in_progress','pending'])->exists())throw new Exception('Existing backup must be reconciled');
  if($p instanceof App\Models\ScheduledDatabaseBackup)App\Jobs\DatabaseBackupJob::dispatch($p);
  else App\Jobs\VolumeBackupJob::dispatch($p);
  $out=['dispatched'=>true];
 }else{
  $rows=$p->executions()->where('created_at','>=',$x['since'])->get();
  if($rows->count()>1)throw new Exception('Ambiguous backup execution requires reconciliation');
  $e=$rows->first();
  $out=$e?$e->only(['uuid','status','filename','size','s3_uploaded','created_at','finished_at']):null;
 }
}else throw new Exception('Unknown fixed operation');
echo "\nBACKUP_RESULT=".json_encode($out)."\n";
'''.replace("PAYLOAD", literal)
    result = subprocess.run(["docker", "exec", "-i", "coolify", "php"], input=source,
                            text=True, capture_output=True, timeout=90)
    marker = "BACKUP_RESULT="
    if result.returncode or marker not in result.stdout:
        # Do not echo generated remote commands or exception arguments.
        raise RuntimeError("Scoped Coolify operation failed: " + action)
    return json.loads(result.stdout.rsplit(marker, 1)[1].splitlines()[0])


def coordinator(config, target, action):
    return php(config, "coordinator", {"target": target, "operation": action})


def atomic_write(filename, data):
    Path(filename).parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    temporary = str(filename) + ".next"
    with open(temporary, "w", encoding="utf-8") as stream:
        os.chmod(temporary, 0o600)
        json.dump(data, stream, indent=2)
        stream.flush()
        os.fsync(stream.fileno())
    os.replace(temporary, filename)


def run(config, state_path):
    validate(config)
    previous = json.loads(Path(state_path).read_text()) if Path(state_path).exists() else {}
    if previous.get("active"):
        raise RuntimeError("Previous incomplete backup requires reconciliation")
    if php(config, "mount") != EXPECTED_MOUNT:
        raise RuntimeError("Backup filesystem missing or UUID mismatch")
    state = {"pair": str(uuid.uuid4()), "project": config["project"], "active": True,
             "started": datetime.datetime.now(datetime.timezone.utc).isoformat(), "executions": []}
    atomic_write(state_path, state)
    restore = []
    paused_container = None
    try:
        for target in ("production-website",):
            status = coordinator(config, target, "status")
            if not status.get("paused"):
                coordinator(config, target, "pause")
                restore.append(target)
        deadline = time.monotonic() + 3600
        while any(coordinator(config, target, "status").get("active")
                  for target in ("production-website",)):
            if time.monotonic() >= deadline:
                raise RuntimeError("Active release did not finish; no writers paused")
            time.sleep(5)
        containers = php(config, "containers").splitlines()
        if len(containers) != 1:
            raise RuntimeError("Expected exactly one backend writer")
        container = containers[0]
        if php(config, "paused", {"container": container}) == "true":
            raise RuntimeError("Backend already paused; preserve operator state")
        paused_container = container
        state["container"] = paused_container
        state["image"] = php(config, "image", {"container": paused_container})
        atomic_write(state_path, state)
        php(config, "pause", {"container": paused_container})
        for plan in [config["database_plan"], *config["file_plans"], *config.get("coordinator_file_plans", [])]:
            since = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
            state["dispatch"] = {"plan": plan, "since": since}
            atomic_write(state_path, state)  # Ambiguous dispatch never automatically repeats.
            php(config, "dispatch", {"plan": plan})
            deadline = time.monotonic() + 3600
            while True:
                execution = php(config, "status", {"plan": plan, "since": since})
                if execution and execution["status"] in TERMINAL:
                    if execution["status"] != "success" or not execution.get("s3_uploaded"):
                        raise RuntimeError("Native backup or S3 replication failed")
                    state["executions"].append({"plan": plan, **execution})
                    atomic_write(state_path, state)
                    break
                if time.monotonic() >= deadline:
                    raise RuntimeError("Native backup deadline exceeded")
                time.sleep(3)
        state["success"] = True
    except Exception as error:
        state["success"] = False
        state["error"] = str(error)
        raise
    finally:
        # Recovery occurs even when local creation/upload fails. Unknown dispatches
        # remain active and require an operator to reconcile before another run.
        recovered = True
        if paused_container:
            try:
                php(config, "unpause", {"container": paused_container})
            except Exception:
                recovered = False
        for target in restore:
            try:
                coordinator(config, target, "resume")
            except Exception:
                recovered = False
        state["writersRecovered"] = recovered
        state["active"] = not state.get("success", False) or not recovered
        state["finished"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        atomic_write(state_path, state)
        if state.get("success") and recovered:
            atomic_write(Path(state_path).parent / (state["pair"] + ".json"), state)
        if not recovered:
            raise RuntimeError("Writer/release recovery requires immediate attention")
    return state


if __name__ == "__main__":
    def interrupted(signum, frame):
        raise RuntimeError("Backup interrupted; inspect saved execution state")
    signal.signal(signal.SIGTERM, interrupted)
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", required=True)
    parser.add_argument("--initial-check", action="store_true")
    arguments = parser.parse_args()
    configuration = json.loads(Path(arguments.config).read_text())
    if not configuration.get("enabled") and not arguments.initial_check:
        raise SystemExit("Project backup schedule is not enabled")
    try:
        receipt = run(configuration, configuration["state_file"])
        print(json.dumps({"project": configuration["project"], "pair": receipt["pair"],
                          "success": receipt["success"], "s3Verified": True}))
    except Exception as error:
        print(json.dumps({"project": configuration.get("project"), "success": False,
                          "error": str(error)}))
        raise SystemExit(1)

