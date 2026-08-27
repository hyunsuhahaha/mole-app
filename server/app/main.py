from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from .engine import run_dig
from .sec_client import SecClient

app = FastAPI(title="Stock Digger API", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:8081","http://localhost:8082"], allow_methods=["GET"], allow_headers=["*"])
sec = SecClient()


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status":"ok","source":"SEC EDGAR"}


@app.get("/api/dig")
async def dig(growth_min: float = Query(10, ge=-100, le=500), dilution_max: float = Query(15, ge=0, le=1000)):
    return await run_dig(sec, growth_min, dilution_max)
