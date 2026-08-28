# Stock Digger API

FastAPI proxy and screening engine backed by official SEC EDGAR company facts and submissions APIs.

```bash
copy .env.example .env
python -m pip install -r server/requirements.txt
python -m uvicorn server.app.main:app --reload --port 8001 --env-file .env
```

The local SEC snapshot currently covers thousands of US-listed reporting companies. Toss Securities Open API is the primary KR/US quote, candle, and Korean stock-directory provider when `TOSS_INVEST_CLIENT_ID` and `TOSS_INVEST_CLIENT_SECRET` are configured. Twelve Data remains a fallback. SEC EDGAR and OpenDART remain the sources for company financial statements.
