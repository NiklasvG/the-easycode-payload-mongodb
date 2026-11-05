import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("backup_pair", Path(__file__).with_name("production-backup-pair.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
TEMP_ROOT = Path(__file__).resolve().parents[2] / ".quality-release" / "backup-test-tmp"
TEMP_ROOT.mkdir(parents=True, exist_ok=True)


class BackupPairTest(unittest.TestCase):
    def config(self):
        return {"project": "a" * 24, "server": "b" * 24, "backend": "c" * 24,
                "database_plan": "d" * 24, "file_plans": ["e" * 24],
                "coordinator": "f" * 24}

    def exercise(self, s3=True, mount=None):
        calls = []
        def php(config, action, extra=None):
            calls.append(action)
            if action == "mount": return mount or module.EXPECTED_MOUNT
            if action == "containers": return "123456abcdef"
            if action == "image": return "sha256:test"
            if action == "status": return {"uuid": "f" * 24, "status": "success", "s3_uploaded": s3}
        def coordinator(config, target, action):
            calls.append(action + ":" + target)
            return {"paused": False, "active": None}
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as directory:
            state = Path(directory) / "state.json"
            with patch.object(module, "php", php), patch.object(module, "coordinator", coordinator):
                if not s3 or mount:
                    with self.assertRaises(RuntimeError): module.run(self.config(), state)
                else:
                    result = module.run(self.config(), state)
                    self.assertTrue(result["success"])
                    self.assertEqual(2, len(result["executions"]))
            return calls, json.loads(state.read_text()) if state.exists() else None

    def test_success_pairs_both_plans_and_recovers_writers(self):
        calls, state = self.exercise()
        self.assertEqual(2, calls.count("dispatch"))
        self.assertIn("unpause", calls)
        self.assertFalse(state["active"])

    def test_s3_failure_recovers_writers_but_requires_reconciliation(self):
        calls, state = self.exercise(s3=False)
        self.assertIn("unpause", calls)
        self.assertIn("resume:production-website", calls)
        self.assertFalse(state["success"])
        self.assertTrue(state["active"])
        self.assertEqual(1, calls.count("dispatch"))

    def test_wrong_mount_never_pauses_writers(self):
        calls, state = self.exercise(mount="wrong")
        self.assertEqual(["mount"], calls)
        self.assertIsNone(state)

    def test_invalid_mapping_is_rejected(self):
        config = self.config()
        config["backend"] = "other; command"
        with self.assertRaises(ValueError): module.validate(config)

    def test_unknown_previous_dispatch_is_not_repeated(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as directory:
            state = Path(directory) / "state.json"
            state.write_text(json.dumps({"active": True}))
            with patch.object(module, "php") as php:
                with self.assertRaises(RuntimeError): module.run(self.config(), state)
                php.assert_not_called()

    def test_oneshot_mode_blocks_an_unfinished_release_before_writer_pause(self):
        with tempfile.TemporaryDirectory(dir=TEMP_ROOT) as directory:
            root = Path(directory)
            (root / 'state.json').write_text(json.dumps({'active': {'phase': 'unknown'}}))
            config_path = root / 'config.json'
            config_path.write_text(json.dumps({'state_directory': str(root)}))
            config = self.config()
            config.update(coordinator='', release_job_config=str(config_path))
            calls = []
            def php(config, action, extra=None):
                calls.append(action)
                if action == 'mount': return module.EXPECTED_MOUNT
            with patch.object(module, 'php', php), patch.object(module, 'coordinator') as coordinator:
                with self.assertRaisesRegex(RuntimeError, 'Unfinished release'):
                    module.run(config, root / 'backup.json')
                coordinator.assert_not_called()
            self.assertEqual(calls, ['mount'])


if __name__ == "__main__":
    unittest.main()
