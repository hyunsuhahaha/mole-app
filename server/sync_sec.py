"""Build the local screening snapshot from SEC's official nightly bulk archive."""

import argparse
import json
import os
import tempfile
import zipfile
from pathlib import Path

import httpx

from app.engine import metrics_from_facts
from app.repository import MetricsRepository

TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
FACTS_URL = "https://www.sec.gov/Archives/edgar/daily-index/xbrl/companyfacts.zip"


def download(client: httpx.Client, url: str, target: Path) -> None:
    with client.stream("GET", url) as response:
        response.raise_for_status()
        with target.open("wb") as output:
            for chunk in response.iter_bytes():
                output.write(chunk)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="Development-only ticker limit")
    args = parser.parse_args()
    user_agent = os.getenv("SEC_USER_AGENT", "")
    if "@" not in user_agent:
        raise SystemExit('Set SEC_USER_AGENT, for example "Stock Digger Company contact@example.com"')

    headers = {"User-Agent": user_agent, "Accept-Encoding": "gzip, deflate"}
    with httpx.Client(headers=headers, timeout=180, follow_redirects=True) as client:
        tickers = client.get(TICKERS_URL).json()
        entries = list(tickers.values())
        if args.limit:
            entries = entries[: args.limit]
        with tempfile.TemporaryDirectory(prefix="stock-digger-sec-") as temp:
            archive = Path(temp) / "companyfacts.zip"
            print("Downloading SEC nightly company facts archive…", flush=True)
            download(client, FACTS_URL, archive)
            metrics = []
            with zipfile.ZipFile(archive) as bundle:
                names = set(bundle.namelist())
                for index, entry in enumerate(entries, 1):
                    cik = int(entry["cik_str"])
                    filename = f"CIK{cik:010d}.json"
                    if filename not in names:
                        continue
                    facts = json.loads(bundle.read(filename))
                    metric = metrics_from_facts(entry["ticker"], cik, facts)
                    if metric.revenue_growth is not None:
                        metrics.append(metric.__dict__)
                    if index % 500 == 0:
                        print(f"Parsed {index:,}/{len(entries):,} tickers", flush=True)

    count = MetricsRepository().replace_all(metrics)
    print(f"Published {count:,} companies to the local snapshot")


if __name__ == "__main__":
    main()
