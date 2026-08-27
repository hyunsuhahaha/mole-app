export type StockResult={ticker:string;company:string;score:number;reason:string;risk:string};
export const stages=[{count:4821,label:'Listed universe'},{count:1921,label:'Market cap fit'},{count:612,label:'Growth holds up'},{count:84,label:'Profitable enough'},{count:5,label:'Final dig'}];
export const mockResults:StockResult[]=[
{ticker:'MELI',company:'MercadoLibre',score:92,reason:'Strong revenue growth with expanding margins',risk:'Premium valuation'},
{ticker:'NU',company:'Nu Holdings',score:88,reason:'Rapid customer growth and improving efficiency',risk:'Regulatory exposure'},
{ticker:'DUOL',company:'Duolingo',score:85,reason:'Durable engagement and subscription momentum',risk:'High expectations'},
{ticker:'CELH',company:'Celsius Holdings',score:81,reason:'Category growth with a clean balance sheet',risk:'Distributor concentration'},
{ticker:'TMDX',company:'TransMedics',score:79,reason:'Large unmet need and accelerating adoption',risk:'Execution complexity'}];
export const researchApi={async runScreen(){await new Promise(r=>setTimeout(r,250));return mockResults}};
