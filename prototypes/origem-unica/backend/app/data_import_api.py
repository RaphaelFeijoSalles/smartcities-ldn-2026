"""Opt-in isolated router. Disabled without server token; no central route edits."""
from __future__ import annotations

import base64
import binascii
import json
import os
import secrets

from fastapi import APIRouter, FastAPI, HTTPException, Request
from starlette.concurrency import run_in_threadpool

from app.data_review import ReviewRejected, review
from app.tabular_compare import compare
from app.tabular_import import MAX_BYTES, ImportRejected, analyze, read_table

MAX_REQUEST_BYTES = 2 * ((MAX_BYTES + 2) // 3 * 4) + 16384


def _document(value):
    if not isinstance(value, dict) or set(value) - {'filename', 'content_base64', 'provenance', 'mapping'}:
        raise ImportRejected('invalid_document')
    filename, encoded = value.get('filename'), value.get('content_base64')
    if not isinstance(filename, str) or not 1 <= len(filename) <= 128 or not isinstance(encoded, str):
        raise ImportRejected('invalid_document')
    if len(encoded) > ((MAX_BYTES + 2) // 3 * 4):
        raise ImportRejected('file_size_limit')
    try:
        payload = base64.b64decode(encoded, validate=True)
    except (ValueError, binascii.Error) as exc:
        raise ImportRejected('invalid_base64') from exc
    if not isinstance(value.get('provenance'), dict):
        raise ImportRejected('invalid_provenance')
    return read_table(payload, filename), value['provenance'], value.get('mapping')


def _execute(data, operation):
    if not isinstance(data, dict):
        raise ImportRejected('invalid_request')
    if operation == 'profile':
        if set(data) != {'document'}:
            raise ImportRejected('expected_document')
        return analyze(*_document(data['document']))[0]
    required = {'left', 'right', 'report_id', 'decisions'} if operation == 'review' else {'left', 'right'}
    if set(data) != required:
        raise ImportRejected('invalid_comparison_or_review_fields')
    left, lm, lmap = _document(data['left'])
    right, rm, rmap = _document(data['right'])
    report = compare(left, lm, right, rm, lmap, rmap)
    return review(report, data['report_id'], data['decisions']) if operation == 'review' else report


def data_import_router(token: str | None = None) -> APIRouter:
    router = APIRouter(prefix='/api/data-import', tags=['Public data import v1'])
    expected = token if token is not None else os.getenv('ORIGEM_UNICA_DATA_IMPORT_TOKEN', '')

    async def process(request: Request, operation: str):
        if not expected:
            raise HTTPException(503, 'data_import_disabled')
        authorization = request.headers.get('authorization', '')
        if not secrets.compare_digest(authorization.encode(), ('Bearer ' + expected).encode()):
            raise HTTPException(401, 'unauthorized')
        if request.headers.get('content-type', '').split(';')[0].strip().lower() != 'application/json':
            raise HTTPException(415, 'application_json_required')
        body = bytearray()
        async for chunk in request.stream():
            if len(body) + len(chunk) > MAX_REQUEST_BYTES:
                raise HTTPException(413, 'request_size_limit')
            body.extend(chunk)
        try:
            data = json.loads(body)
            return await run_in_threadpool(_execute, data, operation)
        except (UnicodeError, json.JSONDecodeError, RecursionError):
            raise HTTPException(422, 'invalid_json') from None
        except (ImportRejected, ReviewRejected) as exc:
            raise HTTPException(422, str(exc)) from None

    @router.post('/profile')
    async def profile(request: Request):
        return await process(request, 'profile')

    @router.post('/compare')
    async def comparison(request: Request):
        return await process(request, 'compare')

    @router.post('/review')
    async def human_review(request: Request):
        return await process(request, 'review')

    return router


def create_data_import_app() -> FastAPI:
    """Local restricted demo; integrator may mount router in the main app later."""
    app = FastAPI(title='Origem Única — Data Import', version='1')
    app.include_router(data_import_router())
    return app
