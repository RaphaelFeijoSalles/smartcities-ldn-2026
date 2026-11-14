from __future__ import annotations

import threading
import time
import os
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

from app.adapters import CnesAdapter, CsvAdapter, SiglonAdapter, SourceAdapter, utc_now
from app.matching import reconcile
from app.models import AdapterResult


class ReconciliationService:
    def __init__(
        self,
        adapters: list[SourceAdapter] | None = None,
        fallback_csv: Path | None = None,
        cache_seconds: int = 60,
    ) -> None:
        self.fallback_csv = fallback_csv or Path(__file__).resolve().parents[1] / "data" / "fallback_mock.csv"
        self.adapters = adapters or (
            [CsvAdapter(self.fallback_csv, source) for source in ("SIGLON", "CNES")]
            if os.environ.get("ORIGEM_UNICA_MOCK") == "1"
            else [SiglonAdapter(), CnesAdapter()]
        )
        self.cache_seconds = cache_seconds
        self._lock = threading.Lock()
        self._cached_at = 0.0
        self._snapshot: dict[str, Any] | None = None

    def snapshot(self, force: bool = False) -> dict[str, Any]:
        with self._lock:
            if not force and self._snapshot and time.monotonic() - self._cached_at < self.cache_seconds:
                return self._snapshot
            with ThreadPoolExecutor(max_workers=len(self.adapters)) as executor:
                results = list(executor.map(self._safe_fetch, self.adapters))
            left = results[0].records
            right = results[1].records if len(results) > 1 else []
            items = reconcile(left, right)
            statuses = [result.status_payload() for result in results]
            live_count = sum(result.status == "LIVE" for result in results)
            # The shared contract has no MIXED mode. Any synthetic input makes
            # the overall demo MOCK; each source still exposes its provenance.
            mode = "LIVE" if live_count == len(results) else "MOCK"
            self._snapshot = {
                "mode": mode,
                "generated_at": utc_now(),
                "items": items,
                "sources": statuses,
            }
            self._cached_at = time.monotonic()
            return self._snapshot

    def _safe_fetch(self, adapter: SourceAdapter) -> AdapterResult:
        try:
            return adapter.fetch()
        except Exception as exc:  # source failure is represented in the API status
            fallback = CsvAdapter(self.fallback_csv, source_filter=adapter.source).fetch()
            fallback.status = "FALLBACK"
            fallback.error = f"{type(exc).__name__}: {exc}"
            return fallback
