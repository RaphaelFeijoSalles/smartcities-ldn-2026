"""Same-origin loopback workspace for the existing data-import router."""
import asyncio
from collections import deque
import ipaddress
import os
from pathlib import Path
import time
from urllib.parse import urlsplit

from fastapi import HTTPException
from starlette.datastructures import Headers, MutableHeaders
from starlette.responses import FileResponse, JSONResponse

from app.data_import_api import data_import_router

UI_PATH = "/data-import"
API_PATH = "/api/data-import"
UI_DIR = Path(__file__).with_name("data_import_ui")
MAX_ATTEMPTS = 12
WINDOW_SECONDS = 60
UPLOAD_SECONDS = 10
CSP = ("default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; "
       "base-uri 'none'; form-action 'none'; frame-ancestors 'none'")


def in_namespace(path, prefix):
    return path == prefix or path.startswith(prefix + "/")


def local_origin(scope, headers):
    try:
        client = scope.get("client")
        if not client or not ipaddress.ip_address(client[0]).is_loopback:
            return None
        hosts = headers.getlist("host")
        if len(hosts) != 1 or scope["scheme"] != "http":
            return None
        raw = hosts[0]
        parsed = urlsplit("http://" + raw)
        if parsed.hostname not in {"localhost", "127.0.0.1", "::1"}:
            return None
        normalized_host = "[::1]" if parsed.hostname == "::1" else parsed.hostname
        normalized = normalized_host + (f":{parsed.port}" if parsed.port is not None else "")
        if raw != normalized:
            return None
        return "http://" + (normalized_host if parsed.port == 80 else normalized)
    except (TypeError, ValueError):
        return None


class LocalImportBoundary:
    """Gate only this workspace. Call the original router with server-held auth."""

    def __init__(self, app, token):
        self.app = app
        self.authorization = ("Bearer " + token).encode("ascii")
        self.attempts = deque()
        self.busy = False

    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        path = scope["path"]
        api = in_namespace(path, API_PATH)
        if not api and not in_namespace(path, UI_PATH):
            await self.app(scope, receive, send)
            return

        async def protected_send(message):
            if message["type"] == "http.response.start":
                response_headers = MutableHeaders(scope=message)
                response_headers.update({
                    "Cache-Control": "no-store", "Content-Security-Policy": CSP,
                    "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff",
                })
            await send(message)

        async def reject(status, reason, headers=None):
            await JSONResponse({"detail": reason}, status, headers=headers)(scope, receive, protected_send)

        headers = Headers(scope=scope)
        origin = local_origin(scope, headers)
        origins = headers.getlist("origin")
        if not origin or (origins and origins != [origin]) or any(
            name in headers for name in ("Forwarded", "X-Forwarded-For", "X-Forwarded-Host", "X-Forwarded-Proto")
        ):
            await reject(403, "local_origin_required")
            return
        if not api or scope["method"] != "POST":
            await self.app(scope, receive, protected_send)
            return
        if origins != [origin] or headers.getlist("x-public-data") != ["confirmed"] or "authorization" in headers:
            await reject(403, "same_origin_public_data_required")
            return

        now = time.monotonic()
        while self.attempts and now - self.attempts[0] >= WINDOW_SECONDS:
            self.attempts.popleft()
        if self.busy or len(self.attempts) >= MAX_ATTEMPTS:
            retry = WINDOW_SECONDS if not self.busy else 1
            await reject(429, "local_import_quota", {"Retry-After": str(retry)})
            return

        self.attempts.append(now)
        self.busy = True
        deadline = now + UPLOAD_SECONDS

        async def bounded_receive():
            try:
                return await asyncio.wait_for(receive(), deadline - time.monotonic())
            except TimeoutError:
                raise HTTPException(408, "local_import_upload_timeout") from None

        try:
            internal = {**scope, "headers": [*scope["headers"], (b"authorization", self.authorization)]}
            await self.app(internal, bounded_receive, protected_send)
        finally:
            self.busy = False


def enable_local_data_import(app):
    if os.getenv("ORIGEM_UNICA_DATA_IMPORT_LOCAL") != "1":
        return
    token = os.getenv("ORIGEM_UNICA_DATA_IMPORT_TOKEN", "")
    if len(token) < 32 or any(not 33 <= ord(char) <= 126 for char in token):
        raise ValueError("Local data import requires a server token of at least 32 printable ASCII characters.")

    @app.get(UI_PATH, include_in_schema=False)
    def workspace():
        return FileResponse(UI_DIR / "index.html", media_type="text/html")

    @app.get(UI_PATH + "/workspace.mjs", include_in_schema=False)
    def workspace_code():
        return FileResponse(UI_DIR / "workspace.mjs", media_type="text/javascript")

    @app.get(UI_PATH + "/workspace.css", include_in_schema=False)
    def workspace_style():
        return FileResponse(UI_DIR / "workspace.css", media_type="text/css")

    app.include_router(data_import_router(token), include_in_schema=False)
    # Added after the public CORS middleware, so this boundary evaluates first.
    app.add_middleware(LocalImportBoundary, token=token)
