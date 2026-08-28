from tempfile import TemporaryDirectory
from pathlib import Path

from app.repository import MetricsRepository


def row(ticker: str, growth: float) -> dict:
    return {"ticker": ticker, "company": ticker, "cik": 1, "revenue_growth": growth,
            "cash": None, "dilution": None, "operating_income": None,
            "filing_url": None, "filing_label": None}


with TemporaryDirectory() as directory:
    repository = MetricsRepository(Path(directory) / "test.db")
    assert repository.replace_all([row("AAA", 10), row("BBB", 20)]) == 2
    assert {item["ticker"] for item in repository.load_all()} == {"AAA", "BBB"}
    repository.replace_all([row("CCC", 30)])
    loaded = repository.load_all()
    assert [item["ticker"] for item in loaded] == ["CCC"]
    assert loaded[0]["revenue_history"] == []
    assert repository.find("CCC")["company"] == "CCC"
    assert repository.find("MISSING") is None
    assert [item["ticker"] for item in repository.search("CC")] == ["CCC"]
    assert [item["ticker"] for item in repository.search("")] == ["CCC"]
    assert repository.status()["syncedAt"]

print("repository snapshot check passed")
