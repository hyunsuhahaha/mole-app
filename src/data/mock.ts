export type Evidence = { label:string; value:string; source:string; sourceType:'10-Q'|'Earnings'|'Filing'|'Clinical' };
export type StockResult = { ticker:string; company:string; score:number; preRiskScore:number; reason:string; risk:string; whyFound:string; strongestCase:string; penalty:string; reversalEvent:string; evidence:Evidence[]; riskFindings:string[] };
export type DigStage = { count:number; label:string; removed:number; explanation:string; rejected:{ticker:string;reason:string}[] };

export const stages:DigStage[]=[
{count:5213,label:'전체 상장 종목',removed:0,explanation:'미국 주요 거래소의 보통주를 출발점으로 삼았어요.',rejected:[]},
{count:1482,label:'성장률 필터',removed:3731,explanation:'설정한 매출 성장 기준을 충족하지 못한 기업을 걷어냈어요.',rejected:[{ticker:'F',reason:'최근 매출 성장률이 기준 미달'},{ticker:'INTC',reason:'성장 회복이 아직 불확실'}]},
{count:721,label:'현금 부족 제거',removed:761,explanation:'현재 지출 속도로 현금 버팀 기간이 부족한 기업을 제외했어요.',rejected:[{ticker:'BYND',reason:'추정 현금 버팀 기간 12개월 미만'},{ticker:'SPCE',reason:'높은 현금 소진 속도'}]},
{count:204,label:'과도한 희석 제거',removed:517,explanation:'최근 주식 수 증가가 큰 기업을 제외했어요.',rejected:[{ticker:'MULN',reason:'최근 1년 발행주식 수 급증'},{ticker:'OPEN',reason:'주식 보상과 증자 부담'}]},
{count:38,label:'가격 부담 점검',removed:166,explanation:'성장 대비 기업가치가 지나치게 높은 종목을 덜어냈어요.',rejected:[{ticker:'PLTR',reason:'성장 대비 높은 매출 배수'},{ticker:'CVNA',reason:'낙관적 기대가 가격에 크게 반영'}]},
{count:5,label:'근거 교차검증',removed:33,explanation:'공시와 실적 자료에서 성장 근거와 위험 신호를 다시 확인했어요.',rejected:[{ticker:'XYZ',reason:'핵심 주장과 원문 근거 불일치'},{ticker:'ABCD',reason:'12개월 내 촉매가 불분명'}]},
];

export const mockResults:StockResult[]=[
{ticker:'MELI',company:'MercadoLibre',score:88,preRiskScore:92,reason:'매출 성장과 이익률 개선이 함께 확인됨',risk:'높은 기업가치',whyFound:'커머스와 핀테크가 동시에 성장하면서 영업 레버리지가 나타나고 있어요.',strongestCase:'최근 분기 매출 성장과 영업이익률 개선이 동시에 이어졌어요.',penalty:'높은 선행 밸류에이션 때문에 4점 감점',reversalEvent:'거래액 성장률이 두 분기 연속 둔화되면 판단을 다시 봐야 해요.',evidence:[{label:'현금 및 단기투자자산',value:'$7.8B',source:'2026 Q2 10-Q · 데모 근거',sourceType:'10-Q'},{label:'분기 매출 성장률',value:'+34% YoY',source:'2026 Q2 실적발표 · 데모 근거',sourceType:'Earnings'}],riskFindings:['밸류에이션 부담','중남미 환율 변동성']},
{ticker:'NU',company:'Nu Holdings',score:84,preRiskScore:88,reason:'고객 증가와 비용 효율 개선이 동시에 진행',risk:'규제 환경 변화',whyFound:'낮은 고객 획득 비용을 유지하면서 수익성이 빠르게 좋아지고 있어요.',strongestCase:'활성 고객당 비용이 안정적인 가운데 고객 기반이 확대됐어요.',penalty:'지역별 금융 규제 불확실성으로 4점 감점',reversalEvent:'연체율이 가이던스 범위를 넘으면 투자 논리가 약해져요.',evidence:[{label:'활성 고객 수',value:'118M',source:'2026 Q2 실적발표 · 데모 근거',sourceType:'Earnings'},{label:'효율성 비율',value:'29%',source:'2026 Q2 20-F 보충자료 · 데모 근거',sourceType:'Filing'}],riskFindings:['브라질 신용 사이클','금융 규제 강화 가능성']},
{ticker:'DUOL',company:'Duolingo',score:81,preRiskScore:85,reason:'이용자 참여도와 구독 매출의 질이 높음',risk:'높은 시장 기대치',whyFound:'일간 이용자와 유료 전환율이 함께 개선되어 성장의 질이 좋아요.',strongestCase:'일간 활성 이용자 증가가 유료 구독 성장으로 연결되고 있어요.',penalty:'높은 성장 기대가 주가에 반영되어 4점 감점',reversalEvent:'일간 이용자 성장률이 20% 아래로 내려가면 재검토가 필요해요.',evidence:[{label:'일간 활성 이용자',value:'+41% YoY',source:'2026 Q2 주주서한 · 데모 근거',sourceType:'Earnings'}],riskFindings:['기대치가 높은 주가','AI 기능의 경쟁 심화']},
{ticker:'CELH',company:'Celsius Holdings',score:77,preRiskScore:81,reason:'성장 시장과 건전한 재무구조를 보유',risk:'유통사 의존도',whyFound:'에너지 음료 시장 점유율 확대 여지와 순현금 구조를 함께 갖췄어요.',strongestCase:'재고 정상화 이후 판매 추세가 회복되는 신호가 보여요.',penalty:'대형 유통 파트너 의존으로 4점 감점',reversalEvent:'미국 소매 판매가 두 분기 연속 감소하면 판단이 뒤집혀요.',evidence:[{label:'현금 및 현금성자산',value:'$903M',source:'2026 Q2 10-Q · 데모 근거',sourceType:'10-Q'}],riskFindings:['유통사 집중도','카테고리 경쟁 심화']},
{ticker:'TMDX',company:'TransMedics',score:73,preRiskScore:79,reason:'미충족 의료 수요와 빠른 도입 속도',risk:'복잡한 사업 실행',whyFound:'장기 관류 시스템과 물류망 결합이 이식 시장의 병목을 줄이고 있어요.',strongestCase:'시스템 사용량과 서비스 매출이 함께 증가하고 있어요.',penalty:'운영 복잡성과 집중된 제품군으로 6점 감점',reversalEvent:'이식 건수 성장이나 센터 확장이 멈추면 전제를 다시 확인해야 해요.',evidence:[{label:'분기 매출 성장률',value:'+52% YoY',source:'2026 Q2 실적발표 · 데모 근거',sourceType:'Earnings'},{label:'임상 등록',value:'진행 중',source:'ClinicalTrials.gov · 데모 근거',sourceType:'Clinical'}],riskFindings:['물류망 실행 위험','단일 플랫폼 의존']},
];
export const researchApi={async runScreen(){await new Promise(r=>setTimeout(r,250));return mockResults}};
