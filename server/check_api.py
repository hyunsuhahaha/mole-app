import os
from tempfile import TemporaryDirectory
from pathlib import Path

with TemporaryDirectory() as directory:
    os.environ["STOCK_DIGGER_DB"] = str(Path(directory) / "api.db")
    os.environ["ALLOW_LIVE_SEC_FALLBACK"] = "false"

    from fastapi.testclient import TestClient
    from app.main import app
    from app.engine import repository

    client = TestClient(app)
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "degraded"

    metric = {"ticker": "TEST", "company": "Test Co", "cik": 1,
              "revenue_growth": 20, "cash": 100, "dilution": 2,
              "operating_income": 10, "filing_url": "https://www.sec.gov/",
              "filing_label": "10-Q · 2026-01-01"}
    repository.replace_all([metric])
    response = client.get("/api/dig?growth_min=15&dilution_max=5&profit_required=true")
    assert response.status_code == 200
    assert [item["ticker"] for item in response.json()["results"]] == ["TEST"]
    assert response.json()["exactMatchCount"] == 1
    assert response.json()["resultMode"] == "exact"
    closest = client.get("/api/dig?growth_min=25&dilution_max=5&profit_required=true")
    assert closest.status_code == 200
    assert closest.json()["exactMatchCount"] == 0
    assert closest.json()["resultMode"] == "closest"
    assert closest.json()["results"][0]["matchStatus"] == "closest"
    assert closest.json()["results"][0]["missedConditions"] == ["매출 증가가 기준보다 5.0%p 낮아요"]
    assert response.headers["cache-control"] == "public, max-age=300"
    search = client.get("/api/stocks/search?q=TEST")
    assert search.status_code == 200
    assert search.json()["items"][0]["ticker"] == "TEST"
    detail = client.get("/api/stocks/TEST")
    assert detail.status_code == 200
    assert detail.json()["company"] == "Test Co"
    assert client.get("/api/stocks/MISSING").status_code == 404
    assert client.get("/api/dig?growth_min=9999").status_code == 422
    assert client.get("/api/market/lowercase").status_code == 422
    assert client.get("/api/market/TEST").status_code == 503

print("api contract check passed")
