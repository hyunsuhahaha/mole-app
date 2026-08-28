import type { Filters, ScreeningProfile } from "../store/useDigStore";
import type { RiskProfile } from "../data/riskProfile";
import type { DigStage, StockResult } from "../data/mock";
import Constants from "expo-constants";
export type StockSearchItem = {
  ticker: string;
  company: string;
  revenue_growth: number | null;
  operating_income: number | null;
  dividend_per_share: number | null;
  dividend_years: number | null;
  filing_label: string | null;
  market?: "US" | "KR";
  exchange?: string;
  price_access?: string;
};
export type DigResponse = {
  results: StockResult[];
  stages: DigStage[];
  source: string;
  scope: string;
  dataAsOf?: string | null;
  unsupported: string[];
  market: "US";
  universeCount: number;
  priceCheckedCount: number;
  coverageComplete: boolean;
  exactMatchCount: number;
  resultMode: "exact" | "closest";
};
export type MarketDataResponse = {
  ticker: string;
  name: string;
  currency: string;
  price: number;
  previousClose: number;
  change: number;
  percentChange: number;
  marketOpen: boolean;
  asOf?: string;
  source: string;
  history: {
    date: string;
    close: number;
    open?: number;
    high?: number;
    low?: number;
    volume?: number;
  }[];
};
function resolveApiUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const developmentHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (__DEV__ && developmentHost) return `http://${developmentHost}:8001`;
  if (__DEV__) return "http://localhost:8001";

  throw new Error(
    "출시 빌드에는 EXPO_PUBLIC_API_URL로 HTTPS 데이터 서버 주소를 설정해야 해요.",
  );
}
const API_URL = resolveApiUrl();
function growthValue(value: string) {
  if (value === "상관없음") return -100;
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 10;
}
function dilutionValue(value: string) {
  if (value === "5% 이하") return 5;
  if (value === "많이 늘리면 제외") return 15;
  if (value === "조금은 허용") return 30;
  return 1000;
}
export const researchApi = {
  async runScreen(
    filters: Filters,
    profile?: ScreeningProfile | null,
    risk?: RiskProfile | null,
  ): Promise<DigResponse> {
    const answers = profile?.answers ?? {};
    const numberFrom = (value = "") => Number(value.match(/\d+/)?.[0] ?? 0);
    const peLimits: Record<string, number> = {
      pe_15: 15,
      pe_25: 25,
      pe_40: 40,
      pe_any: 0,
    };
    const capLimits: Record<string, number> = {
      cap_micro: 300_000_000,
      cap_small: 2_000_000_000,
      cap_mid: 10_000_000_000,
      cap_any: 0,
    };
    const params = new URLSearchParams({
      growth_min: String(growthValue(filters.growth)),
      dilution_max: String(dilutionValue(filters.dilution)),
      profit_required: String(filters.lossAllowed === "제외"),
      intent: profile?.intentId ?? "growth",
      risk_level: risk?.level ?? "balanced",
      drawdown_min: String(numberFrom(answers.drawdown)),
      pe_max: String(peLimits[answers.pe] ?? 0),
      yield_min: String(numberFrom(answers.yield)),
      dividend_years_min: String(numberFrom(answers.dividendYears)),
      cap_max: String(capLimits[answers.companySize] ?? 0),
    });
    const response = await fetch(`${API_URL}/api/dig?${params}`);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(
        body?.detail ?? `자료를 가져오지 못했어요 (${response.status})`,
      );
    }
    return response.json();
  },
  async getMarketData(
    ticker: string,
    exchange?: string,
  ): Promise<MarketDataResponse> {
    const params = exchange ? `?${new URLSearchParams({ exchange })}` : "";
    const response = await fetch(
      `${API_URL}/api/market/${encodeURIComponent(ticker)}${params}`,
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(
        body?.detail ?? `가격을 가져오지 못했어요 (${response.status})`,
      );
    }
    return response.json();
  },
  async searchStocks(
    query = "",
    limit = 20,
    market: "US" | "KR" = "US",
    featured = false,
  ): Promise<{
    items: StockSearchItem[];
    count: number;
    market: "US" | "KR";
    source: string;
  }> {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      market,
      featured: String(featured),
    });
    const response = await fetch(`${API_URL}/api/stocks/search?${params}`);
    if (!response.ok) throw new Error("종목 목록을 가져오지 못했어요.");
    return response.json();
  },
  async getStock(ticker: string): Promise<StockResult> {
    const response = await fetch(
      `${API_URL}/api/stocks/${encodeURIComponent(ticker)}`,
    );
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.detail ?? "회사 자료를 가져오지 못했어요.");
    }
    return response.json();
  },
};
