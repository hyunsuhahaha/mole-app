import type{Filters}from'../store/useDigStore';import type{DigStage,StockResult}from'../data/mock';
export type DigResponse={results:StockResult[];stages:DigStage[];source:string;scope:string;unsupported:string[]};
const API_URL=process.env.EXPO_PUBLIC_API_URL??'http://localhost:8001';
function growthValue(value:string){const match=value.match(/\d+/);return match?Number(match[0]):10}
function dilutionValue(value:string){if(value==='심한 희석 제외')return 15;if(value==='보통까지 허용')return 30;return 1000}
export const researchApi={async runScreen(filters:Filters):Promise<DigResponse>{const params=new URLSearchParams({growth_min:String(growthValue(filters.growth)),dilution_max:String(dilutionValue(filters.dilution))});const response=await fetch(`${API_URL}/api/dig?${params}`);if(!response.ok)throw new Error(`Dig Engine 오류 (${response.status})`);return response.json()}};
