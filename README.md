# Stock Digger

A playful, research-first stock screening MVP built with Expo and React Native.

## Run

```bash
npm install
npm start
```

Open the project with Expo Go on Android or iOS. The FastAPI service is required for live SEC data.

## Real financial data

The app now includes a FastAPI Dig Engine backed by official SEC EDGAR company facts and filing submissions. Set `SEC_USER_AGENT` to an app name plus a real contact email, start the API on port 8001, and then start Expo.

```bash
copy .env.example .env
python -m pip install -r server/requirements.txt
python -m uvicorn server.app.main:app --port 8001 --env-file .env
npm start
```

The first real-data scope is an eight-company validation universe. SEC-derived filters currently cover revenue growth, cash, operating income, share dilution, and filing evidence. Price, market cap, one-year return, and future catalysts remain explicitly unsupported until a licensed market-data provider is added.
