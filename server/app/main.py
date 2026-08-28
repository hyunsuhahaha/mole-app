import os

import httpx
from fastapi import FastAPI, HTTPException, Path, Query, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from .engine import Metrics, repository, run_dig, to_result
from .sec_client import SecClient
from .market_data import MarketDataClient

origins = [item.strip() for item in os.getenv("ALLOWED_ORIGINS", "http://localhost:8081,http://localhost:8082").split(",") if item.strip()]
app = FastAPI(title="Stock Digger API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET"], allow_headers=["Accept", "Content-Type"])
sec = SecClient()
market_data = MarketDataClient()


@app.exception_handler(httpx.HTTPError)
async def upstream_error(_: Request, __: httpx.HTTPError) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": "공식 자료 제공처에 잠시 연결할 수 없어요."})


@app.exception_handler(RuntimeError)
async def data_error(_: Request, __: RuntimeError) -> JSONResponse:
    return JSONResponse(status_code=503, content={"detail": "사용 가능한 회사 자료 스냅샷이 없어요."})


@app.get("/health")
async def health() -> dict:
    snapshot = repository.status()
    return {"status":"ok" if snapshot["count"] else "degraded", "source":"SEC EDGAR", "marketDataSource": market_data.provider, "snapshot": snapshot}


@app.get("/api/dig")
async def dig(
    request: Request,
    response: Response,
    growth_min: float = Query(10, ge=-100, le=500),
    dilution_max: float = Query(15, ge=0, le=1000),
    profit_required: bool = Query(False),
    intent: str = Query("growth", pattern=r"^(growth|quality|fallen|value|dividend|emerging)$"),
    risk_level: str = Query("balanced", pattern=r"^(stable|balanced|aggressive)$"),
    drawdown_min: float = Query(0, ge=0, le=100),
    pe_max: float = Query(0, ge=0, le=1000),
    yield_min: float = Query(0, ge=0, le=100),
    dividend_years_min: int = Query(0, ge=0, le=100),
    cap_max: float = Query(0, ge=0),
):
    result = await run_dig(
        sec, growth_min, dilution_max, profit_required, intent, risk_level,
        market_data, drawdown_min, pe_max, yield_min, dividend_years_min, cap_max,
    )
    response.headers["Cache-Control"] = "public, max-age=300"
    return result


@app.get("/api/market/{ticker}")
async def market_snapshot(
    response: Response,
    ticker: str = Path(min_length=1, max_length=10, pattern=r"^[A-Z0-9][A-Z0-9.-]*$"),
    exchange: str | None = Query(None, max_length=12, pattern=r"^[A-Z0-9.-]+$"),
):
    try:
        result = await market_data.snapshot(ticker, exchange)
    except (RuntimeError, httpx.HTTPError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=503, detail="시세 제공자 연결을 확인해주세요.")
    response.headers["Cache-Control"] = "public, max-age=60"
    return result


@app.get("/api/stocks/search")
async def stock_search(
    response: Response,
    q: str = Query("", max_length=80),
    limit: int = Query(20, ge=1, le=50),
    market: str = Query("US", pattern=r"^(US|KR)$"),
    featured: bool = Query(False),
):
    response.headers["Cache-Control"] = "public, max-age=60"
    if market == "US":
        return {"items": repository.search(q, limit, featured), "query": q, "count": repository.status()["count"], "market":"US", "source":"SEC EDGAR"}
    try:
        directory = await market_data.stock_directory("South Korea")
    except (RuntimeError, httpx.HTTPError, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=503, detail="국내 종목 목록을 가져오지 못했어요.")
    clean = q.strip().casefold()
    matches = [item for item in directory if not clean or clean in str(item.get("symbol", "")).casefold() or clean in str(item.get("name", "")).casefold()]
    matches.sort(key=lambda item: (0 if str(item.get("symbol", "")).casefold() == clean else 1, str(item.get("symbol", ""))))
    items = [{
        "ticker": item.get("symbol"), "company": item.get("name") or item.get("symbol"),
        "exchange": item.get("exchange") or "KRX", "market":"KR",
        "price_access": (item.get("access") or {}).get("global"),
        "revenue_growth":None,"operating_income":None,"dividend_per_share":None,
        "dividend_years":None,"filing_label":None,
    } for item in matches[:limit]]
    return {"items":items,"query":q,"count":len(directory),"market":"KR","source":f"{market_data.provider} 종목 목록"}


@app.get("/api/stocks/{ticker}")
async def stock_detail(
    response: Response,
    ticker: str = Path(min_length=1, max_length=10, pattern=r"^[A-Z][A-Z0-9.-]*$"),
):
    row = repository.find(ticker)
    if not row:
        raise HTTPException(status_code=404, detail="이 종목의 회사 공시 자료를 찾지 못했어요.")
    response.headers["Cache-Control"] = "public, max-age=300"
    return to_result(Metrics(**row))
