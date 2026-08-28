import asyncio
import httpx

from app.market_data import MarketDataClient


def handler(request: httpx.Request) -> httpx.Response:
    if request.url.path == "/oauth2/token":
        return httpx.Response(200, json={"access_token":"token","expires_in":3600})
    if request.url.path == "/api/v1/prices":
        return httpx.Response(200, json={"result":[{"symbol":"005930","lastPrice":"101.5","currency":"KRW","timestamp":"2026-01-02T15:30:00+09:00"}]})
    if request.url.path == "/api/v1/candles":
        return httpx.Response(200, json={"result":{"candles":[
            {"timestamp":"2026-01-02T09:00:00+09:00","openPrice":"100","highPrice":"102","lowPrice":"99","closePrice":"101.5","volume":"200"},
            {"timestamp":"2026-01-01T09:00:00+09:00","openPrice":"99","highPrice":"101","lowPrice":"98","closePrice":"100","volume":"100"},
        ]}})
    if request.url.path == "/api/v1/stocks":
        return httpx.Response(200, json={"result":[{"symbol":"005930","name":"삼성전자","currency":"KRW"}]})
    if request.url.path == "/api/v1/stocks/all":
        return httpx.Response(200, json={"result":[{"symbol":"005930","name":"삼성전자"}]})
    if request.url.path == "/stocks":
        return httpx.Response(200, json={"status":"ok","data":[{"symbol":"005930","name":"Samsung Electronics","exchange":"KRX"}]})
    if request.url.path == "/quote":
        return httpx.Response(200, json={"symbol":"TEST","name":"Test","currency":"USD","datetime":"2026-01-02","close":"101.5","previous_close":"100","change":"1.5","percent_change":"1.5","is_market_open":False})
    return httpx.Response(200, json={"status":"ok","values":[{"datetime":"2026-01-02","close":"101.5"},{"datetime":"2026-01-01","close":"100"}]})


async def check() -> None:
    client = MarketDataClient("test-key", httpx.MockTransport(handler))
    result = await client.snapshot("TEST")
    assert result["price"] == 101.5
    assert result["history"] == [
        {"date":"2026-01-01","open":100.0,"high":100.0,"low":100.0,"close":100.0,"volume":0.0},
        {"date":"2026-01-02","open":101.5,"high":101.5,"low":101.5,"close":101.5,"volume":0.0},
    ]
    assert await client.snapshot("TEST") is result
    directory = await client.stock_directory("South Korea")
    assert directory[0]["symbol"] == "005930"
    assert await client.stock_directory("South Korea") is directory

    toss_client = MarketDataClient("", httpx.MockTransport(handler), "client", "secret")
    toss_result = await toss_client.snapshot("005930")
    assert toss_result["source"] == "토스증권 Open API"
    assert toss_result["price"] == 101.5
    assert toss_result["previousClose"] == 100.0
    assert toss_result["history"][0]["close"] == 100.0


asyncio.run(check())
print("market data check passed")
