import{create}from'zustand';import type{StockResult}from'../data/mock';
type Filters={style:string;industry:string;cap:string;growth:string;profit:string;dilution:string;horizon:string};type State={filters:Filters;results:StockResult[];setFilter:(key:keyof Filters,value:string)=>void;setResults:(r:StockResult[])=>void;reset:()=>void};
const defaults:Filters={style:'Growth',industry:'Any industry',cap:'$2B–$50B',growth:'15%+',profit:'Profitable',dilution:'Low',horizon:'3–5 years'};
export const useDigStore=create<State>(set=>({filters:defaults,results:[],setFilter:(key,value)=>set(s=>({filters:{...s.filters,[key]:value}})),setResults:results=>set({results}),reset:()=>set({filters:defaults,results:[]})}));
