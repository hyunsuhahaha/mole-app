import{create}from'zustand';import{stages as demoStages}from'../data/mock';import type{StockResult,DigStage}from'../data/mock';
export type Filters={style:string;industry:string;cap:string;growth:string;horizon:string;lossAllowed:string;dilution:string;runup:string;cashRunway:string;catalyst:string};
type State={filters:Filters;results:StockResult[];digStages:DigStage[];setFilter:(key:keyof Filters,value:string)=>void;setDigData:(r:StockResult[],s:DigStage[])=>void;reset:()=>void};
const defaults:Filters={style:'성장주',industry:'전체 산업',cap:'20억–500억 달러',growth:'15% 이상',horizon:'3–5년',lossAllowed:'적자 허용',dilution:'심한 희석 제외',runup:'급등 종목 제외',cashRunway:'18개월 이상',catalyst:'촉매 필수'};
export const useDigStore=create<State>(set=>({filters:defaults,results:[],digStages:demoStages,setFilter:(key,value)=>set(s=>({filters:{...s.filters,[key]:value}})),setDigData:(results,digStages)=>set({results,digStages}),reset:()=>set({filters:defaults,results:[],digStages:demoStages})}));
