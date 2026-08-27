export type StockResult={ticker:string;company:string;score:number;reason:string;risk:string};
export const stages=[{count:4821,label:'전체 상장 종목'},{count:1921,label:'시가총액 조건 통과'},{count:612,label:'성장성 조건 통과'},{count:84,label:'수익성 조건 통과'},{count:5,label:'최종 발굴 종목'}];
export const mockResults:StockResult[]=[
{ticker:'MELI',company:'MercadoLibre',score:92,reason:'높은 매출 성장과 함께 이익률이 개선되고 있어요',risk:'높은 기업가치'},
{ticker:'NU',company:'Nu Holdings',score:88,reason:'고객이 빠르게 늘고 운영 효율도 좋아지고 있어요',risk:'규제 환경 변화'},
{ticker:'DUOL',company:'Duolingo',score:85,reason:'꾸준한 이용률과 구독 매출 성장이 돋보여요',risk:'높은 시장 기대치'},
{ticker:'CELH',company:'Celsius Holdings',score:81,reason:'성장하는 시장과 건전한 재무구조를 갖췄어요',risk:'유통사 의존도'},
{ticker:'TMDX',company:'TransMedics',score:79,reason:'큰 미충족 수요와 빠른 도입 속도가 보여요',risk:'복잡한 사업 실행'}];
export const researchApi={async runScreen(){await new Promise(r=>setTimeout(r,250));return mockResults}};
