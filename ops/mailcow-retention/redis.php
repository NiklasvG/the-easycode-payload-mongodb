$request=json_decode(stream_get_contents(STDIN),true,512,JSON_THROW_ON_ERROR);
$redis=new Redis();
$redis->connect('redis-mailcow',6379,5);
$redis->auth(getenv('REDISPASS'));
$keys=['ACME_LOG','POSTFIX_MAILLOG','DOVECOT_MAILLOG','SOGO_LOG','NETFILTER_LOG','AUTODISCOVER_LOG','API_LOG','RL_LOG','WATCHDOG_LOG','CRON_LOG'];
function allowed($key,$keys){return in_array($key,$keys,true)||preg_match('/^rs_history[A-Za-z0-9_.:-]{0,160}$/D',$key)||preg_match('/^MAILCOW_RETENTION_TEST_[A-Za-z0-9_]+$/D',$key);}
if($request['operation']==='history_keys'){
    $cursor=null;$result=[];
    do{$items=$redis->scan($cursor,'rs_history*',100);if($items)foreach($items as $key){if(!allowed($key,$keys))throw new Exception('Unexpected history key');$result[]=$key;}}while($cursor!==0);
    echo json_encode(array_values(array_unique($result)));
}elseif(in_array($request['operation'],['read','remove'],true)){
    $key=$request['key'];if(!allowed($key,$keys))throw new Exception('Invalid fixed log key');
    if($redis->lLen($key)>100000)throw new Exception('Unexpected log list size');
    if($request['operation']==='read'){
        echo json_encode(array_map('base64_encode',$redis->lRange($key,0,-1)));
    }else{
        foreach($request['hashes'] as $hash)if(!preg_match('/^[a-f0-9]{40}$/D',$hash))throw new Exception('Invalid record digest');
        $lua= <<<'LUA'
local wanted=cjson.decode(ARGV[1]);local lookup={};for _,h in ipairs(wanted) do lookup[h]=true end
local ttl=redis.call('PTTL',KEYS[1]);local rows=redis.call('LRANGE',KEYS[1],0,-1);local keep={};local count=0
for _,row in ipairs(rows) do if lookup[redis.sha1hex(row)] then count=count+1 else table.insert(keep,row) end end
if count>0 then
 redis.call('DEL',KEYS[1]);for first=1,#keep,500 do local batch={};for i=first,math.min(first+499,#keep) do table.insert(batch,keep[i]) end;redis.call('RPUSH',KEYS[1],unpack(batch)) end
 if ttl>0 and #keep>0 then redis.call('PEXPIRE',KEYS[1],ttl) end
end
return count
LUA;
        echo json_encode($redis->eval($lua,[$key,json_encode($request['hashes'])],1));
    }
}else{throw new Exception('Unknown fixed retention operation');}
