"""EcoVisão P0: synthetic-only occurrence API, no CV or real-world enforcement.

Run from repository root:
  pip install -r prototypes/ecovisao/api/requirements.txt
  uvicorn prototypes.ecovisao.api.main:app --reload

The API accepts ONLY synthetic examples. This is a hackathon adapter contract,
not a detector, a public reporting portal or a system for fines.
"""
from __future__ import annotations

import json
import os
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field


ROOT = Path(__file__).resolve().parent
FRONTEND = ROOT.parent / "web"
DB_PATH = Path(os.getenv("ECOVISAO_DB", str(ROOT / "demo.sqlite")))


@contextmanager
def database():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=5.0)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


class OccurrenceIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    tipo: Literal["possivel_acumulo_residuos"] = "possivel_acumulo_residuos"
    bairro: str = Field(min_length=1, max_length=80)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timestamp: str = Field(min_length=10, max_length=35)
    confianca: float = Field(ge=0, le=1)
    source_kind: Literal["DEMO_SYNTHETIC"] = "DEMO_SYNTHETIC"
    location_source: Literal["DEMO_SYNTHETIC"] = "DEMO_SYNTHETIC"
    imagem: str | None = Field(default=None, max_length=120)


class ReviewIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["CONFIRMED_FOR_INSPECTION", "REJECTED"]
    note: str = Field(default="", max_length=500)


def init_db():
    with database() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS ocorrencias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,
                bairro TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                timestamp TEXT NOT NULL,
                confianca REAL NOT NULL,
                source_kind TEXT NOT NULL,
                location_source TEXT NOT NULL,
                imagem TEXT,
                status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
                review_note TEXT NOT NULL DEFAULT ''
            )
        """)
        count = conn.execute("SELECT COUNT(*) FROM ocorrencias").fetchone()[0]
        if count == 0:
            demo = json.loads((ROOT / "fixtures.json").read_text(encoding="utf8"))
            for record in demo:
                obj = OccurrenceIn.model_validate(record)
                conn.execute("""
                    INSERT INTO ocorrencias
                    (tipo,bairro,latitude,longitude,timestamp,confianca,
                     source_kind,location_source,imagem)
                    VALUES (?,?,?,?,?,?,?,?,?)
                """, (obj.tipo, obj.bairro, obj.latitude, obj.longitude,
                      obj.timestamp, obj.confianca, obj.source_kind,
                      obj.location_source, obj.imagem))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="EcoVisão — API de demonstração",
    description="Todas as coordenadas, ocorrências e métricas são SINTÉTICAS. Detector YOLO: NOT RUN.",
    version="0.1.0",
    lifespan=lifespan,
)
app.mount("/assets", StaticFiles(directory=FRONTEND), name="assets")


@app.get("/")
def home():
    return FileResponse(FRONTEND / "index.html")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "mode": "DEMO_SYNTHETIC",
        "detector": "NOT_RUN",
        "external_integrations": False,
    }


@app.get("/api/ocorrencias")
def list_occurrences(status: str | None = Query(default=None, max_length=32)):
    with database() as conn:
        if status is None:
            rows = conn.execute("SELECT * FROM ocorrencias ORDER BY id").fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM ocorrencias WHERE status = ? ORDER BY id", (status,)
            ).fetchall()
    return {"mode": "DEMO_SYNTHETIC", "items": [dict(row) for row in rows]}


@app.post("/api/ocorrencias", status_code=201)
def create_occurrence(payload: OccurrenceIn):
    with database() as conn:
        cursor = conn.execute("""
            INSERT INTO ocorrencias
            (tipo,bairro,latitude,longitude,timestamp,confianca,
             source_kind,location_source,imagem)
            VALUES (?,?,?,?,?,?,?,?,?)
        """, (payload.tipo, payload.bairro, payload.latitude, payload.longitude,
              payload.timestamp, payload.confianca, payload.source_kind,
              payload.location_source, payload.imagem))
        row = conn.execute(
            "SELECT * FROM ocorrencias WHERE id = ?", (cursor.lastrowid,)
        ).fetchone()
    return dict(row)


@app.patch("/api/ocorrencias/{event_id}/review")
def review_occurrence(event_id: int, payload: ReviewIn):
    with database() as conn:
        updated = conn.execute(
            "UPDATE ocorrencias SET status = ?, review_note = ? WHERE id = ?",
            (payload.status, payload.note, event_id),
        )
        if updated.rowcount == 0:
            raise HTTPException(status_code=404, detail="Ocorrência não encontrada")
        row = conn.execute(
            "SELECT * FROM ocorrencias WHERE id = ?", (event_id,)
        ).fetchone()
    return dict(row)


@app.get("/api/metricas")
def metrics():
    with database() as conn:
        total = conn.execute("SELECT COUNT(*) FROM ocorrencias").fetchone()[0]
        pending = conn.execute(
            "SELECT COUNT(*) FROM ocorrencias WHERE status='PENDING_REVIEW'"
        ).fetchone()[0]
        verified = conn.execute(
            "SELECT COUNT(*) FROM ocorrencias WHERE status='CONFIRMED_FOR_INSPECTION'"
        ).fetchone()[0]
        rejected = conn.execute(
            "SELECT COUNT(*) FROM ocorrencias WHERE status='REJECTED'"
        ).fetchone()[0]
        groups = conn.execute(
            "SELECT bairro, COUNT(*) AS total FROM ocorrencias GROUP BY bairro ORDER BY bairro"
        ).fetchall()
    return {
        "mode": "DEMO_SYNTHETIC",
        "total_candidates": total,
        "pending_review": pending,
        "confirmed_for_inspection": verified,
        "rejected": rejected,
        "by_bairro": [dict(r) for r in groups],
    }
