import os
import json
import sqlite3
from contextlib import closing
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

DEFAULT_DB = Path(__file__).resolve().parents[1] / "data" / "stock_digger.db"


class MetricsRepository:
    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path or os.getenv("STOCK_DIGGER_DB", DEFAULT_DB))
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path, timeout=30)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with closing(self._connect()) as db, db:
            db.execute("PRAGMA journal_mode=WAL")
            db.execute(
                """
                CREATE TABLE IF NOT EXISTS company_metrics (
                    ticker TEXT PRIMARY KEY,
                    company TEXT NOT NULL,
                    cik INTEGER NOT NULL,
                    revenue_growth REAL,
                    cash REAL,
                    dilution REAL,
                    operating_income REAL,
                    shares_outstanding REAL,
                    eps_ttm REAL,
                    dividend_per_share REAL,
                    dividend_years INTEGER,
                    dividend_growth REAL,
                    filing_url TEXT,
                    filing_label TEXT,
                    revenue_history TEXT NOT NULL DEFAULT '[]',
                    synced_at TEXT NOT NULL
                )
                """
            )
            columns = {row["name"] for row in db.execute("PRAGMA table_info(company_metrics)")}
            if "revenue_history" not in columns:
                db.execute("ALTER TABLE company_metrics ADD COLUMN revenue_history TEXT NOT NULL DEFAULT '[]'")
            for name, kind in (("shares_outstanding", "REAL"), ("eps_ttm", "REAL"), ("dividend_per_share", "REAL"), ("dividend_years", "INTEGER"), ("dividend_growth", "REAL")):
                if name not in columns:
                    db.execute(f"ALTER TABLE company_metrics ADD COLUMN {name} {kind}")
            db.execute("CREATE INDEX IF NOT EXISTS idx_metrics_growth ON company_metrics(revenue_growth)")
            db.execute("CREATE INDEX IF NOT EXISTS idx_metrics_profit ON company_metrics(operating_income)")
            db.execute("CREATE INDEX IF NOT EXISTS idx_metrics_dilution ON company_metrics(dilution)")

    def upsert(self, metric: dict[str, Any]) -> None:
        values = {
            "shares_outstanding": None, "eps_ttm": None, "dividend_per_share": None,
            "dividend_years": None, "dividend_growth": None,
            **metric,
            "revenue_history": json.dumps(metric.get("revenue_history") or []),
            "synced_at": datetime.now(UTC).isoformat(timespec="seconds"),
        }
        with closing(self._connect()) as db, db:
            db.execute(
                """
                INSERT INTO company_metrics (
                    ticker, company, cik, revenue_growth, cash, dilution,
                    operating_income, shares_outstanding, eps_ttm, dividend_per_share,
                    dividend_years, dividend_growth, filing_url, filing_label, revenue_history, synced_at
                ) VALUES (
                    :ticker, :company, :cik, :revenue_growth, :cash, :dilution,
                    :operating_income, :shares_outstanding, :eps_ttm, :dividend_per_share,
                    :dividend_years, :dividend_growth, :filing_url, :filing_label, :revenue_history, :synced_at
                )
                ON CONFLICT(ticker) DO UPDATE SET
                    company=excluded.company,
                    cik=excluded.cik,
                    revenue_growth=excluded.revenue_growth,
                    cash=excluded.cash,
                    dilution=excluded.dilution,
                    operating_income=excluded.operating_income,
                    shares_outstanding=excluded.shares_outstanding,
                    eps_ttm=excluded.eps_ttm,
                    dividend_per_share=excluded.dividend_per_share,
                    dividend_years=excluded.dividend_years,
                    dividend_growth=excluded.dividend_growth,
                    filing_url=excluded.filing_url,
                    filing_label=excluded.filing_label,
                    revenue_history=excluded.revenue_history,
                    synced_at=excluded.synced_at
                """,
                values,
            )

    def replace_all(self, metrics: list[dict[str, Any]]) -> int:
        """Atomically publish a fully parsed snapshot; keep the old one on failure."""
        synced_at = datetime.now(UTC).isoformat(timespec="seconds")
        defaults = {"shares_outstanding": None, "eps_ttm": None, "dividend_per_share": None, "dividend_years": None, "dividend_growth": None}
        rows = [{**defaults, **metric, "revenue_history": json.dumps(metric.get("revenue_history") or []), "synced_at": synced_at} for metric in metrics]
        with closing(self._connect()) as db, db:
            db.execute("BEGIN IMMEDIATE")
            db.execute("DELETE FROM company_metrics")
            db.executemany(
                """
                INSERT INTO company_metrics (
                    ticker, company, cik, revenue_growth, cash, dilution,
                    operating_income, shares_outstanding, eps_ttm, dividend_per_share,
                    dividend_years, dividend_growth, filing_url, filing_label, revenue_history, synced_at
                ) VALUES (
                    :ticker, :company, :cik, :revenue_growth, :cash, :dilution,
                    :operating_income, :shares_outstanding, :eps_ttm, :dividend_per_share,
                    :dividend_years, :dividend_growth, :filing_url, :filing_label, :revenue_history, :synced_at
                )
                """,
                rows,
            )
        return len(rows)

    def load_all(self) -> list[dict[str, Any]]:
        with closing(self._connect()) as db, db:
            rows = db.execute(
                """
                SELECT ticker, company, cik, revenue_growth, cash, dilution,
                       operating_income, shares_outstanding, eps_ttm, dividend_per_share,
                       dividend_years, dividend_growth, filing_url, filing_label, revenue_history
                FROM company_metrics
                """
            ).fetchall()
        result = [dict(row) for row in rows]
        for item in result:
            item["revenue_history"] = json.loads(item["revenue_history"] or "[]")
        return result

    def find(self, ticker: str) -> dict[str, Any] | None:
        with closing(self._connect()) as db:
            row = db.execute(
                """
                SELECT ticker, company, cik, revenue_growth, cash, dilution,
                       operating_income, shares_outstanding, eps_ttm, dividend_per_share,
                       dividend_years, dividend_growth, filing_url, filing_label, revenue_history
                FROM company_metrics WHERE ticker = ?
                """,
                (ticker.upper(),),
            ).fetchone()
        if not row:
            return None
        result = dict(row)
        result["revenue_history"] = json.loads(result["revenue_history"] or "[]")
        return result

    def search(self, query: str, limit: int = 20, featured: bool = False) -> list[dict[str, Any]]:
        clean = query.strip()
        with closing(self._connect()) as db:
            if clean:
                pattern = f"%{clean}%"
                rows = db.execute(
                    """
                    SELECT ticker, company, revenue_growth, operating_income,
                           dividend_per_share, dividend_years, filing_label
                    FROM company_metrics
                    WHERE ticker LIKE ? COLLATE NOCASE OR company LIKE ? COLLATE NOCASE
                    ORDER BY CASE WHEN ticker = ? COLLATE NOCASE THEN 0 ELSE 1 END,
                             CASE WHEN ticker LIKE ? COLLATE NOCASE THEN 0 ELSE 1 END,
                             company ASC
                    LIMIT ?
                    """,
                    (pattern, pattern, clean, f"{clean}%", limit),
                ).fetchall()
            elif featured:
                rows = db.execute(
                    """
                    SELECT ticker, company, revenue_growth, operating_income,
                           dividend_per_share, dividend_years, filing_label
                    FROM company_metrics
                    WHERE operating_income > 0 AND revenue_growth BETWEEN 5 AND 100
                    ORDER BY revenue_growth DESC
                    LIMIT ?
                    """,
                    (limit,),
                ).fetchall()
            else:
                rows = db.execute(
                    """
                    SELECT ticker, company, revenue_growth, operating_income,
                           dividend_per_share, dividend_years, filing_label
                    FROM company_metrics
                    ORDER BY ticker ASC
                    LIMIT ?
                    """,
                    (limit,),
                ).fetchall()
        return [dict(row) for row in rows]

    def status(self) -> dict[str, Any]:
        with closing(self._connect()) as db, db:
            row = db.execute(
                "SELECT COUNT(*) AS count, MAX(synced_at) AS synced_at FROM company_metrics"
            ).fetchone()
        return {"count": row["count"], "syncedAt": row["synced_at"]}
