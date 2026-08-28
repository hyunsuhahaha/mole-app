import { create } from "zustand";
import { stages as demoStages } from "../data/mock";
import type { StockResult, DigStage } from "../data/mock";
import type { RiskProfile } from "../data/riskProfile";
export type Filters = {
  style: string;
  industry: string;
  cap: string;
  growth: string;
  horizon: string;
  lossAllowed: string;
  dilution: string;
  runup: string;
  cashRunway: string;
  catalyst: string;
};
export type ScreeningProfile = {
  query: string;
  intentId: string;
  intentTitle: string;
  answers: Record<string, string>;
  must: string[];
  prefer: string[];
  pending: string[];
  answeredCount: number;
  unknownCount: number;
};
type State = {
  filters: Filters;
  riskProfile: RiskProfile | null;
  screeningProfile: ScreeningProfile | null;
  results: StockResult[];
  digStages: DigStage[];
  watchlist: string[];
  setFilter: (key: keyof Filters, value: string) => void;
  setRiskProfile: (profile: RiskProfile) => void;
  setScreeningProfile: (profile: ScreeningProfile) => void;
  setDigData: (r: StockResult[], s: DigStage[]) => void;
  toggleWatchlist: (ticker: string) => void;
  reset: () => void;
};
const defaults: Filters = {
  style: "빠르게 크는 회사",
  industry: "모두 보기",
  cap: "중간 회사",
  growth: "15% 이상",
  horizon: "3–5년",
  lossAllowed: "포함",
  dilution: "많이 늘리면 제외",
  runup: "급등하면 제외",
  cashRunway: "18개월 이상",
  catalyst: "꼭 있어야 함",
};
export const useDigStore = create<State>((set) => ({
  filters: defaults,
  riskProfile: null,
  screeningProfile: null,
  results: [],
  digStages: demoStages,
  watchlist: [],
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  setRiskProfile: (riskProfile) => set({ riskProfile }),
  setScreeningProfile: (screeningProfile) => set({ screeningProfile }),
  setDigData: (results, digStages) => set({ results, digStages }),
  toggleWatchlist: (ticker) => set((state) => ({
    watchlist: state.watchlist.includes(ticker)
      ? state.watchlist.filter((item) => item !== ticker)
      : [...state.watchlist, ticker],
  })),
  reset: () =>
    set({
      filters: defaults,
      riskProfile: null,
      screeningProfile: null,
      results: [],
      digStages: demoStages,
      watchlist: [],
    }),
}));
