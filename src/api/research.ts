import type { Filters } from "../store/useDigStore";
import type { DigStage, StockResult } from "../data/mock";
export type DigResponse = {
  results: StockResult[];
  stages: DigStage[];
  source: string;
  scope: string;
  unsupported: string[];
};
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8001";
function growthValue(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 10;
}
function dilutionValue(value: string) {
  if (value === "많이 늘리면 제외") return 15;
  if (value === "조금은 허용") return 30;
  return 1000;
}
export const researchApi = {
  async runScreen(filters: Filters): Promise<DigResponse> {
    const params = new URLSearchParams({
      growth_min: String(growthValue(filters.growth)),
      dilution_max: String(dilutionValue(filters.dilution)),
    });
    const response = await fetch(`${API_URL}/api/dig?${params}`);
    if (!response.ok)
      throw new Error(`자료를 가져오지 못했어요 (${response.status})`);
    return response.json();
  },
};
