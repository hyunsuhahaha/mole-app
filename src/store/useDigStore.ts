import { create } from "zustand";
import { stages as demoStages } from "../data/mock";
import type { StockResult, DigStage } from "../data/mock";
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
type State = {
  filters: Filters;
  results: StockResult[];
  digStages: DigStage[];
  setFilter: (key: keyof Filters, value: string) => void;
  setDigData: (r: StockResult[], s: DigStage[]) => void;
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
  results: [],
  digStages: demoStages,
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  setDigData: (results, digStages) => set({ results, digStages }),
  reset: () => set({ filters: defaults, results: [], digStages: demoStages }),
}));
