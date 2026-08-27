# Stock Digger API

FastAPI proxy and screening engine backed by official SEC EDGAR company facts and submissions APIs.

```bash
copy .env.example .env
python -m pip install -r server/requirements.txt
python -m uvicorn server.app.main:app --reload --port 8001 --env-file .env
```

The current real-data universe is intentionally limited to eight US-listed companies while the Dig Engine is validated. Market price, market cap, one-year return, and future catalyst filters are not inferred from SEC filings.
