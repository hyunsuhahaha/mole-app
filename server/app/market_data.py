import asyncio
import os
import time
from typing import Any

import httpx


class MarketDataClient:
    """Toss Securities first, with Twelve Data as a local fallback."""

    KR_MARKETS = ("KOSPI", "KOSDAQ", "KR_ETC")
    US_MARKETS = ("NYSE", "NASDAQ", "AMEX", "US_ETC")

    def __init__(
        self,
        api_key: str | None = None,
        transport: httpx.AsyncBaseTransport | None = None,
        toss_client_id: str | None = None,
        toss_client_secret: str | None = None,
    ) -> None:
        self.api_key = api_key if api_key is not None else os.getenv("TWELVE_DATA_API_KEY", "")
        self.toss_client_id = toss_client_id if toss_client_id is not None else os.getenv("TOSS_INVEST_CLIENT_ID", "")
        self.toss_client_secret = toss_client_secret if toss_client_secret is not None else os.getenv("TOSS_INVEST_CLIENT_SECRET", "")
        self.twelve = httpx.AsyncClient(base_url="https://api.twelvedata.com", timeout=12, transport=transport)
        self.toss = httpx.AsyncClient(base_url="https://openapi.tossinvest.com", timeout=15, transport=transport)
        self.cache: dict[str, tuple[float, dict[str, Any]]] = {}
        self.directory_cache: dict[str, tuple[float, list[dict[str, Any]]]] = {}
        self._access_token = ""
        self._token_expires_at = 0.0
        self._token_lock = asyncio.Lock()

    @property
    def provider(self) -> str:
        return "Toss Securities Open API" if self.toss_client_id and self.toss_client_secret else "Twelve Data"

    async def _twelve_get(self, path: str, params: dict[str, Any]) -> dict[str, Any]:
        response = await self.twelve.get(path, params={**params, "apikey": self.api_key})
        response.raise_for_status()
        data = response.json()
        if data.get("status") == "error" or data.get("code"):
            raise RuntimeError("Market data provider rejected the request")
        return data

    async def _token(self) -> str:
        if self._access_token and time.time() < self._token_expires_at - 60:
            return self._access_token
        async with self._token_lock:
            if self._access_token and time.time() < self._token_expires_at - 60:
                return self._access_token
            response = await self.toss.post(
                "/oauth2/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.toss_client_id,
                    "client_secret": self.toss_client_secret,
                },
            )
            response.raise_for_status()
            payload = response.json()
            self._access_token = payload["access_token"]
            self._token_expires_at = time.time() + int(payload.get("expires_in", 3600))
            return self._access_token

    async def _toss_get(self, path: str, params: dict[str, Any]) -> dict[str, Any]:
        token = await self._token()
        response = await self.toss.get(path, params=params, headers={"Authorization": f"Bearer {token}"})
        response.raise_for_status()
        payload = response.json()
        if payload.get("error"):
            raise RuntimeError("Toss Securities rejected the request")
        return payload

    async def snapshot(self, ticker: str, exchange: str | None = None) -> dict[str, Any]:
        cache_key = f"{ticker}:{exchange or ''}"
        cached = self.cache.get(cache_key)
        if cached and time.time() - cached[0] < 30:
            return cached[1]
        if self.toss_client_id and self.toss_client_secret:
            result = await self._toss_snapshot(ticker)
        else:
            result = await self._twelve_snapshot(ticker, exchange)
        self.cache[cache_key] = (time.time(), result)
        return result

    async def _toss_snapshot(self, ticker: str) -> dict[str, Any]:
        price_payload, candle_payload, stock_payload = await asyncio.gather(
            self._toss_get("/api/v1/prices", {"symbols": ticker}),
            self._toss_get("/api/v1/candles", {"symbol": ticker, "interval": "1d", "count": 200, "adjusted": "true"}),
            self._toss_get("/api/v1/stocks", {"symbols": ticker}),
        )
        price = price_payload["result"][0]
        stock = stock_payload["result"][0]
        raw_candles = candle_payload.get("result", {}).get("candles", [])
        history = sorted(
            ({
                "date": item["timestamp"],
                "open": float(item["openPrice"]),
                "high": float(item["highPrice"]),
                "low": float(item["lowPrice"]),
                "close": float(item["closePrice"]),
                "volume": float(item.get("volume", 0) or 0),
            } for item in raw_candles),
            key=lambda item: item["date"],
        )
        current = float(price["lastPrice"])
        if history and abs(history[-1]["close"] - current) < 1e-9 and len(history) > 1:
            previous = history[-2]["close"]
        elif history:
            previous = history[-1]["close"]
        else:
            previous = current
        change = current - previous
        return {
            "ticker": ticker,
            "name": stock.get("name") or stock.get("englishName") or ticker,
            "currency": price.get("currency") or stock.get("currency", "USD"),
            "price": current,
            "previousClose": previous,
            "change": change,
            "percentChange": (change / previous * 100) if previous else 0,
            "marketOpen": False,
            "asOf": price.get("timestamp"),
            "source": "토스증권 Open API",
            "history": history,
        }

    async def _twelve_snapshot(self, ticker: str, exchange: str | None) -> dict[str, Any]:
        if not self.api_key:
            raise RuntimeError("Market data provider is not configured")
        symbol_params = {"symbol": ticker, **({"exchange": exchange} if exchange else {})}
        quote, series = await asyncio.gather(
            self._twelve_get("/quote", symbol_params),
            self._twelve_get("/time_series", {**symbol_params, "interval": "1day", "outputsize": 260}),
        )
        values = list(reversed(series.get("values", [])))
        return {
            "ticker": ticker,
            "name": quote.get("name", ticker),
            "currency": quote.get("currency", "USD"),
            "price": float(quote["close"]),
            "previousClose": float(quote["previous_close"]),
            "change": float(quote["change"]),
            "percentChange": float(quote["percent_change"]),
            "marketOpen": bool(quote.get("is_market_open", False)),
            "asOf": quote.get("datetime"),
            "source": "Twelve Data",
            "history": [{
                "date": item["datetime"],
                "open": float(item.get("open", item["close"])),
                "high": float(item.get("high", item["close"])),
                "low": float(item.get("low", item["close"])),
                "close": float(item["close"]),
                "volume": float(item.get("volume", 0) or 0),
            } for item in values],
        }

    async def stock_directory(self, country: str) -> list[dict[str, Any]]:
        cached = self.directory_cache.get(country)
        if cached and time.time() - cached[0] < 86_400:
            return cached[1]
        if self.toss_client_id and self.toss_client_secret:
            markets = self.KR_MARKETS if country == "South Korea" else self.US_MARKETS
            items = []
            for index, market in enumerate(markets):
                if index:
                    await asyncio.sleep(1.05)
                payload = await self._toss_get("/api/v1/stocks/all", {"market": market, "status": "ACTIVE"})
                items.extend({**item, "exchange": market, "access": {"global": "real-time"}} for item in payload.get("result", []))
        else:
            if not self.api_key:
                raise RuntimeError("Market data provider is not configured")
            payload = await self._twelve_get("/stocks", {"country": country, "show_plan": "true", "outputsize": 5000})
            items = payload.get("data") or []
        self.directory_cache[country] = (time.time(), items)
        return items
