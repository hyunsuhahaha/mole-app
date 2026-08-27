export type Evidence = {
  label: string;
  value: string;
  source: string;
  sourceType: "10-Q" | "Earnings" | "Filing" | "Clinical";
  url?: string | null;
};
export type StockResult = {
  ticker: string;
  company: string;
  score: number;
  preRiskScore: number;
  reason: string;
  risk: string;
  whyFound: string;
  strongestCase: string;
  penalty: string;
  reversalEvent: string;
  evidence: Evidence[];
  riskFindings: string[];
  dataSource?: string;
  asOf?: string;
};
export type DigStage = {
  count: number;
  label: string;
  removed: number;
  explanation: string;
  rejected: { ticker: string; reason: string }[];
};

export const stages: DigStage[] = [
  {
    count: 5213,
    label: "처음 살펴본 회사",
    removed: 0,
    explanation: "미국 시장에 등록된 회사부터 살펴봤어요.",
    rejected: [],
  },
  {
    count: 1482,
    label: "매출이 잘 늘었나",
    removed: 3731,
    explanation: "내가 고른 만큼 매출이 늘지 않은 회사를 뺐어요.",
    rejected: [
      { ticker: "F", reason: "최근 매출 성장률이 기준 미달" },
      { ticker: "INTC", reason: "성장 회복이 아직 불확실" },
    ],
  },
  {
    count: 721,
    label: "현금이 충분한가",
    removed: 761,
    explanation: "지금 가진 현금으로 오래 버티기 어려운 회사를 뺐어요.",
    rejected: [
      { ticker: "BYND", reason: "추정 현금 버팀 기간 12개월 미만" },
      { ticker: "SPCE", reason: "높은 현금 소진 속도" },
    ],
  },
  {
    count: 204,
    label: "주식 수를 너무 늘렸나",
    removed: 517,
    explanation: "주식 수를 많이 늘려 기존 주주의 몫이 작아진 회사를 뺐어요.",
    rejected: [
      { ticker: "MULN", reason: "최근 1년 발행주식 수 급증" },
      { ticker: "OPEN", reason: "주식 보상과 증자 부담" },
    ],
  },
  {
    count: 38,
    label: "가격이 너무 비싼가",
    removed: 166,
    explanation: "회사가 크는 속도보다 가격이 너무 비싼 종목을 뺐어요.",
    rejected: [
      { ticker: "PLTR", reason: "성장 대비 높은 매출 배수" },
      { ticker: "CVNA", reason: "낙관적 기대가 가격에 크게 반영" },
    ],
  },
  {
    count: 5,
    label: "회사 자료로 다시 확인",
    removed: 33,
    explanation: "회사가 낸 자료에서 좋은 점과 위험한 점을 다시 확인했어요.",
    rejected: [
      { ticker: "XYZ", reason: "핵심 주장과 원문 근거 불일치" },
      { ticker: "ABCD", reason: "1년 안에 중요한 일정이 뚜렷하지 않아요" },
    ],
  },
];

export const mockResults: StockResult[] = [
  {
    ticker: "MELI",
    company: "MercadoLibre",
    score: 88,
    preRiskScore: 92,
    reason: "매출이 늘고 실제로 버는 돈도 많아졌어요",
    risk: "회사에 비해 주가가 비쌀 수 있어요",
    whyFound:
      "온라인 쇼핑과 금융 서비스가 함께 크고 실제로 버는 돈도 늘고 있어요.",
    strongestCase: "최근 3개월 동안 매출과 이익이 함께 늘었어요.",
    penalty: "회사가 크는 속도에 비해 주가가 비싸 보여 4점을 뺐어요.",
    reversalEvent:
      "사람들이 사고파는 금액이 6개월 연속 둔화되면 다시 봐야 해요.",
    evidence: [
      {
        label: "회사가 가진 현금성 자산",
        value: "$7.8B",
        source: "2026 Q2 10-Q · 데모 근거",
        sourceType: "10-Q",
      },
      {
        label: "1년 전보다 늘어난 매출",
        value: "+34%",
        source: "2026 Q2 실적발표 · 데모 근거",
        sourceType: "Earnings",
      },
    ],
    riskFindings: ["회사에 비해 비싼 주가", "중남미 환율 변화"],
  },
  {
    ticker: "NU",
    company: "Nu Holdings",
    score: 84,
    preRiskScore: 88,
    reason: "고객은 늘고 운영비 부담은 줄었어요",
    risk: "나라별 금융 규칙이 바뀔 수 있어요",
    whyFound:
      "새 고객을 모으는 비용은 낮게 유지하면서 버는 돈이 빠르게 늘고 있어요.",
    strongestCase: "고객 한 명을 관리하는 비용은 비슷한데 고객 수는 늘었어요.",
    penalty: "나라별 금융 규칙이 바뀔 수 있어 4점을 뺐어요.",
    reversalEvent:
      "돈을 제때 갚지 못하는 고객이 예상보다 많아지면 다시 봐야 해요.",
    evidence: [
      {
        label: "활성 고객 수",
        value: "118M",
        source: "2026 Q2 실적발표 · 데모 근거",
        sourceType: "Earnings",
      },
      {
        label: "수입 중 운영비 비중",
        value: "29%",
        source: "2026 Q2 20-F 보충자료 · 데모 근거",
        sourceType: "Filing",
      },
    ],
    riskFindings: ["브라질 신용 사이클", "금융 규제 강화 가능성"],
  },
  {
    ticker: "DUOL",
    company: "Duolingo",
    score: 81,
    preRiskScore: 85,
    reason: "매일 쓰는 사람과 유료 회원이 함께 늘었어요",
    risk: "사람들의 기대가 이미 주가에 많이 담겼어요",
    whyFound: "매일 쓰는 사람과 돈을 내는 회원이 함께 늘고 있어요.",
    strongestCase: "매일 쓰는 사람이 늘면서 유료 회원도 함께 늘고 있어요.",
    penalty: "높은 성장 기대가 이미 주가에 담겨 4점을 뺐어요.",
    reversalEvent:
      "매일 쓰는 사람의 증가 속도가 20% 아래로 내려가면 다시 봐야 해요.",
    evidence: [
      {
        label: "매일 쓰는 사람 증가",
        value: "+41%",
        source: "2026 Q2 주주서한 · 데모 근거",
        sourceType: "Earnings",
      },
    ],
    riskFindings: [
      "주가에 기대가 많이 담겼어요",
      "AI 기능 경쟁이 심해지고 있어요",
    ],
  },
  {
    ticker: "CELH",
    company: "Celsius Holdings",
    score: 77,
    preRiskScore: 81,
    reason: "시장은 커지고 회사가 가진 현금도 충분해요",
    risk: "큰 판매처 몇 곳에 많이 기대고 있어요",
    whyFound:
      "에너지 음료 시장에서 더 성장할 여지가 있고 빚보다 현금이 많아요.",
    strongestCase: "쌓였던 재고가 줄고 판매가 다시 늘어나는 신호가 보여요.",
    penalty: "큰 판매처 몇 곳에 많이 기대고 있어 4점을 뺐어요.",
    reversalEvent: "미국 소매 판매가 두 분기 연속 감소하면 판단이 뒤집혀요.",
    evidence: [
      {
        label: "현금 및 현금성자산",
        value: "$903M",
        source: "2026 Q2 10-Q · 데모 근거",
        sourceType: "10-Q",
      },
    ],
    riskFindings: ["큰 판매처 의존", "에너지 음료 경쟁 심화"],
  },
  {
    ticker: "TMDX",
    company: "TransMedics",
    score: 73,
    preRiskScore: 79,
    reason: "필요한 환자가 많고 병원 도입도 빨라요",
    risk: "의료 장비와 운송을 함께 운영하기 어려워요",
    whyFound:
      "장기를 안전하게 옮기는 장비와 운송 서비스가 이식 대기 시간을 줄여요.",
    strongestCase: "장비 사용과 운송 서비스 매출이 함께 늘고 있어요.",
    penalty: "운영이 복잡하고 주력 제품이 적어 6점을 뺐어요.",
    reversalEvent:
      "이식 건수 성장이나 센터 확장이 멈추면 전제를 다시 확인해야 해요.",
    evidence: [
      {
        label: "1년 전보다 늘어난 매출",
        value: "+52%",
        source: "2026 Q2 실적발표 · 데모 근거",
        sourceType: "Earnings",
      },
      {
        label: "의료 시험 진행 여부",
        value: "진행 중",
        source: "ClinicalTrials.gov · 데모 근거",
        sourceType: "Clinical",
      },
    ],
    riskFindings: ["운송 운영의 어려움", "한 가지 핵심 서비스에 의존"],
  },
];
export const researchApi = {
  async runScreen() {
    await new Promise((r) => setTimeout(r, 250));
    return mockResults;
  },
};
