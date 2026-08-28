import asyncio
import os
import time
from typing import Any

import httpx

SEC_BASE = "https://data.sec.gov"
SEC_ARCHIVES = "https://www.sec.gov/Archives/edgar/data"
USER_AGENT = os.getenv("SEC_USER_AGENT", "")


class SecClient:
    def __init__(self) -> None:
        self._client = httpx.AsyncClient(
            headers={"User-Agent": USER_AGENT or "Stock Digger (configure SEC_USER_AGENT)", "Accept-Encoding": "gzip, deflate"},
            timeout=20,
        )
        self._cache: dict[str, tuple[float, Any]] = {}
        self._lock = asyncio.Lock()

    async def get_json(self, path: str) -> dict[str, Any]:
        if not USER_AGENT or "@" not in USER_AGENT:
            raise RuntimeError('SEC_USER_AGENT must include the app name and a contact email before live SEC access')
        cached = self._cache.get(path)
        if cached and time.time() - cached[0] < 900:
            return cached[1]
        async with self._lock:
            await asyncio.sleep(0.22)  # Stay comfortably below SEC's 10 req/s ceiling.
            response = await self._client.get(f"{SEC_BASE}{path}")
            response.raise_for_status()
        data = response.json()
        self._cache[path] = (time.time(), data)
        return data

    async def company_facts(self, cik: int) -> dict[str, Any]:
        return await self.get_json(f"/api/xbrl/companyfacts/CIK{cik:010d}.json")

    async def submissions(self, cik: int) -> dict[str, Any]:
        return await self.get_json(f"/submissions/CIK{cik:010d}.json")

    @staticmethod
    def filing_url(cik: int, accession: str, document: str) -> str:
        accession_clean = accession.replace("-", "")
        return f"{SEC_ARCHIVES}/{cik}/{accession_clean}/{document}"
