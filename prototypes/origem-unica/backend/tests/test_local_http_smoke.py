"""Real local HTTP smoke with synthetic sources; never calls external APIs."""
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import time

import httpx


def test_local_server_records_contract(tmp_path):
    backend = Path(__file__).resolve().parents[1]
    repo = backend.parents[2]
    with socket.socket() as listener:
        listener.bind(('127.0.0.1', 0))
        port = listener.getsockname()[1]
    env = dict(os.environ, ORIGEM_UNICA_MOCK='1', ORIGEM_UNICA_AI_MODE='off')
    # Never load .env.local or request housing/provider endpoints in this smoke.
    log_path = tmp_path / 'uvicorn.log'
    with log_path.open('w+') as log:
        server = subprocess.Popen(
            [sys.executable, '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1',
             '--port', str(port)], cwd=backend, env=env, stdout=log, stderr=log,
        )
        try:
            base = f'http://127.0.0.1:{port}'
            deadline = time.monotonic() + 15
            with httpx.Client(base_url=base, trust_env=False, timeout=2) as client:
                while True:
                    try:
                        response = client.get('/api/health')
                        response.raise_for_status()
                        break
                    except httpx.HTTPError:
                        if server.poll() is not None or time.monotonic() >= deadline:
                            raise AssertionError(log_path.read_text())
                        time.sleep(.1)
                assert response.json()['status'] == 'ok'
                records = client.get('/api/records')
                assert records.status_code == 200
                assert records.json()['mode'] == 'MOCK'
                assert records.json()['items']
                statuses = client.get('/api/sources/status').json()['sources']
                assert all(source['status'] == 'MOCK' for source in statuses)
                conflicts = client.get('/api/conflicts').json()
                assert conflicts['count'] == len(conflicts['items'])
                assert all(item['comparison_status'] == 'CONFLICT' for item in conflicts['items'])
                assert client.post('/api/data-import/profile').status_code == 404
            node = shutil.which('node')
            assert node, 'Node required for the independent HTTP contract gate'
            result = subprocess.run(
                [node, str(repo / 'scripts/origem-unica/contract-gate.mjs'),
                 '--url', base + '/api/records'], capture_output=True, text=True, timeout=10,
            )
            assert result.returncode == 0, result.stdout + result.stderr
        finally:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait(timeout=5)
