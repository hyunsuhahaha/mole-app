import{create}from'zustand';import type{StockResult}from'../data/mock';
type Filters={style:string;industry:string;cap:string;growth:string;profit:string;dilution:string;horizon:string};type State={filters:Filters;results:StockResult[];setFilter:(key:keyof Filters,value:string)=>void;setResults:(r:StockResult[])=>void;reset:()=>void};
const defaults:Filters={style:'성장주',industry:'전체 산업',cap:'20억–500억 달러',growth:'15% 이상',profit:'흑자 기업',dilution:'낮음',horizon:'3–5년'};
export const useDigStore=create<State>(set=>({filters:defaults,results:[],setFilter:(key,value)=>set(s=>({filters:{...s.filters,[key]:value}})),setResults:results=>set({results}),reset:()=>set({filters:defaults,results:[]})}));
