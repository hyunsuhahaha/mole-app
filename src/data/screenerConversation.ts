import type { Filters, ScreeningProfile } from "../store/useDigStore";

export type IntentId =
  | "fallen"
  | "growth"
  | "quality"
  | "value"
  | "dividend"
  | "emerging";
export type RuleBucket = "must" | "prefer" | "pending";
export type ConversationAnswers = Record<string, string>;
export type QuestionOption = {
  value: string;
  label: string;
  note: string;
  rule?: string;
  bucket?: RuleBucket;
  filters?: Partial<Filters>;
};
export type ConversationQuestion = {
  key: string;
  text: string;
  help: string;
  bucket: RuleBucket;
  options: QuestionOption[];
  when?: { key: string; values: string[] };
};

const unknown = (filters?: Partial<Filters>): QuestionOption => ({
  value: "unknown",
  label: "잘 모르겠어요",
  note: "이 조건으로 후보를 줄이지 않아요.",
  filters,
});
const option = (
  value: string,
  label: string,
  note: string,
  rule = label,
  filters?: Partial<Filters>,
  bucket?: RuleBucket,
): QuestionOption => ({ value, label, note, rule, filters, bucket });

const automaticallyAppliedQuestions = new Set([
  "growth",
  "profitability",
  "dilution",
  "drawdown",
  "pe",
  "dividendYears",
  "yield",
  "companySize",
]);

export const intents: {
  id: IntentId;
  title: string;
  description: string;
  supported: boolean;
}[] = [
  {
    id: "growth",
    title: "매출이 빠르게 크는 회사",
    description: "성장 속도와 지속 가능성을 SEC 공시로 확인",
    supported: true,
  },
  {
    id: "quality",
    title: "지금 돈을 버는 회사",
    description: "최근 영업 흑자와 주주 희석을 SEC 공시로 확인",
    supported: true,
  },
  {
    id: "fallen",
    title: "많이 떨어졌지만 멀쩡한 회사",
    description: "가격 흐름과 SEC 실적을 함께 비교",
    supported: true,
  },
  {
    id: "value",
    title: "실적에 비해 싸 보이는 회사",
    description: "가격과 회사가 버는 돈을 함께 비교",
    supported: true,
  },
  {
    id: "dividend",
    title: "배당을 꾸준히 주는 회사",
    description: "배당 기록과 현재 지급 여력을 함께 확인",
    supported: true,
  },
  {
    id: "emerging",
    title: "아직 덜 알려진 작은 성장 회사",
    description: "회사 크기와 매출 성장, 생존 위험을 함께 확인",
    supported: true,
  },
];

const commonQuestions: ConversationQuestion[] = [
  {
    key: "growth",
    text: "최근 매출 성장은 어느 정도면 될까요?",
    help: "최근 분기 매출을 1년 전 같은 분기와 비교해 실제 검색에 적용해요.",
    bucket: "must",
    options: [
      option(
        "growth_0",
        "성장하지 않아도 됨",
        "흑자와 재무 상태를 더 중요하게 봐요.",
        "매출 성장률 제한 없음",
        { growth: "상관없음" },
      ),
      option(
        "growth_10",
        "10% 이상",
        "완만하게 성장하는 회사도 포함해요.",
        "최근 매출 10% 이상 성장",
        { growth: "10% 이상" },
      ),
      option(
        "growth_15",
        "15% 이상",
        "성장성과 후보 수의 균형을 잡아요.",
        "최근 매출 15% 이상 성장",
        { growth: "15% 이상" },
      ),
      option(
        "growth_25",
        "25% 이상",
        "빠른 성장 회사만 엄격하게 남겨요.",
        "최근 매출 25% 이상 성장",
        { growth: "25% 이상" },
      ),
      unknown({ growth: "상관없음" }),
    ],
  },
  {
    key: "profitability",
    text: "지금 적자인 회사도 볼까요?",
    help: "최근 분기 영업이익이 양수인지 실제 회사 자료로 확인해요.",
    bucket: "must",
    options: [
      option(
        "profit_only",
        "지금 흑자인 회사만",
        "현재 돈을 버는 회사만 남겨요.",
        "최근 분기 영업 흑자",
        { lossAllowed: "제외" },
      ),
      option(
        "near_profit",
        "곧 흑자면 괜찮음",
        "적자 축소 속도는 후보별로 다시 확인해요.",
        "흑자 전환이 가까운지 확인",
        { lossAllowed: "포함" },
        "pending",
      ),
      option(
        "loss_ok",
        "성장하면 적자도 괜찮음",
        "고른 매출 기준을 통과하면 적자 회사도 포함해요.",
        "적자 회사도 포함",
        { lossAllowed: "포함" },
      ),
      unknown({ lossAllowed: "포함" }),
    ],
  },
  {
    key: "runway",
    text: "적자라면 현금으로 얼마나 버텨야 할까요?",
    help: "추가 자금 조달 없이 버틸 시간을 확인하는 안전 질문이에요.",
    bucket: "pending",
    when: { key: "profitability", values: ["loss_ok", "near_profit"] },
    options: [
      option(
        "runway_24",
        "2년 이상",
        "추가 증자 위험을 낮게 보고 싶을 때 적합해요.",
        "현금 생존기간 24개월 이상",
      ),
      option(
        "runway_18",
        "18개월 이상",
        "다음 몇 분기의 실행 시간을 확보한 회사예요.",
        "현금 생존기간 18개월 이상",
      ),
      option(
        "runway_12",
        "1년 이상",
        "자금 조달 위험을 더 감수해요.",
        "현금 생존기간 12개월 이상",
      ),
      unknown(),
    ],
  },
  {
    key: "dilution",
    text: "주식 수를 자주 늘린 회사는 어떻게 할까요?",
    help: "주식 수가 늘면 같은 회사를 더 많은 주주가 나눠 갖게 돼요.",
    bucket: "must",
    options: [
      option(
        "dilution_5",
        "5% 넘게 늘리면 제외",
        "주주 희석을 매우 엄격하게 봐요.",
        "1년 주식 수 증가 5% 이하",
        { dilution: "5% 이하" },
      ),
      option(
        "dilution_15",
        "15% 넘게 늘리면 제외",
        "성장 회사의 보상 주식은 일부 허용해요.",
        "1년 주식 수 증가 15% 이하",
        { dilution: "많이 늘리면 제외" },
      ),
      option(
        "dilution_30",
        "30% 넘게 늘리면 제외",
        "초기 기업의 자금 조달을 넓게 허용해요.",
        "1년 주식 수 증가 30% 이하",
        { dilution: "조금은 허용" },
      ),
      option(
        "dilution_any",
        "상관없음",
        "이 조건으로는 후보를 제외하지 않아요.",
        "주식 수 증가 제한 없음",
        { dilution: "상관없음" },
      ),
      unknown({ dilution: "상관없음" }),
    ],
  },
];

export const questionsByIntent: Record<IntentId, ConversationQuestion[]> = {
  fallen: [
    {
      key: "drawdown",
      text: "최근 약 1년 고점보다 얼마나 떨어져야 할까요?",
      help: "연결된 일별 가격 약 1년치를 실제 검색에 적용해요.",
      bucket: "must",
      options: [
        option("drop_20", "20% 이상", "일반적인 약세 구간부터 포함해요."),
        option("drop_30", "30% 이상", "뚜렷하게 눌린 후보를 찾아요."),
        option(
          "drop_50",
          "50% 이상",
          "회복 가능성과 구조적 문제를 함께 봐야 해요.",
        ),
        option(
          "drop_70",
          "70% 이상",
          "사업 훼손 가능성이 매우 높은 구간이에요.",
        ),
        unknown(),
      ],
    },
    {
      key: "direction",
      text: "최근 가격 흐름은 어때야 하나요?",
      help: "계속 하락 중인지 바닥을 다지는지 구분해요.",
      bucket: "pending",
      options: [
        option(
          "still_falling",
          "아직 계속 하락 중",
          "싸질 수 있지만 바닥을 확인하기 어려워요.",
        ),
        option("basing", "옆으로 버티는 중", "매도 압력이 줄었는지 살펴봐요."),
        option(
          "rebounding",
          "조금 반등하기 시작",
          "회복 신호가 진짜인지 추가 확인해요.",
        ),
        option(
          "any_direction",
          "흐름은 상관없음",
          "가격 방향으로 제한하지 않아요.",
        ),
        unknown(),
      ],
    },
    {
      key: "reboundEvidence",
      text: "반등을 무엇으로 확인할까요?",
      help: "가격만 오른 것과 회사 상황이 나아진 것을 구분해요.",
      bucket: "pending",
      when: { key: "direction", values: ["rebounding"] },
      options: [
        option(
          "earnings_rebound",
          "실적 발표도 좋아짐",
          "사업 회복이 동반된 반등을 원해요.",
        ),
        option(
          "volume_rebound",
          "거래량도 함께 늘어남",
          "시장 관심이 돌아오는지 봐요.",
        ),
        option(
          "price_only",
          "가격 반등만 확인",
          "거짓 반등 위험을 더 감수해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "damage",
      text: "회사가 얼마나 멀쩡해야 하나요?",
      help: "가격 하락과 사업 훼손을 분리하는 핵심 질문이에요.",
      bucket: "prefer",
      options: [
        option(
          "sales_intact",
          "매출과 이익이 모두 버텨야 함",
          "가장 보수적인 기준이에요.",
        ),
        option(
          "sales_only",
          "매출만 유지되면 됨",
          "단기 이익 감소를 허용해요.",
        ),
        option(
          "temporary_slowdown",
          "일시적 둔화는 괜찮음",
          "회복 근거를 추가로 확인해야 해요.",
        ),
        option(
          "turnaround",
          "회복 가능성만 있으면 됨",
          "위험이 높은 반전 후보까지 포함해요.",
        ),
        unknown(),
      ],
    },
  ],
  growth: [
    {
      key: "durability",
      text: "성장이 얼마나 오래 이어져야 하나요?",
      help: "한 분기 급증과 반복 가능한 성장을 구분해요.",
      bucket: "prefer",
      options: [
        option(
          "durability_3y",
          "3년 이상 꾸준히",
          "검증된 성장 흐름을 우선해요.",
        ),
        option(
          "durability_1y",
          "최근 1년이면 됨",
          "새로운 성장 국면도 포함해요.",
        ),
        option(
          "durability_2q",
          "최근 두 분기",
          "빠른 변화에 더 민감하게 반응해요.",
        ),
        option(
          "durability_1q",
          "이번 분기만 빨라도 됨",
          "일회성 효과 위험을 감수해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "acceleration",
      text: "성장 속도가 더 빨라져야 하나요?",
      help: "높은 성장률과 성장 가속은 다른 신호예요.",
      bucket: "pending",
      options: [
        option(
          "accelerating",
          "전 분기보다 빨라져야 함",
          "성장 모멘텀을 엄격하게 봐요.",
        ),
        option(
          "steady_growth",
          "비슷하게 유지되면 됨",
          "지속성을 더 중요하게 봐요.",
        ),
        option(
          "slowing_ok",
          "조금 느려져도 됨",
          "규모가 커지며 둔화하는 회사를 포함해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "customerProof",
      text: "성장을 무엇으로 확인하고 싶나요?",
      help: "매출 외에 성장이 실제 수요에서 오는지 확인해요.",
      bucket: "prefer",
      options: [
        option(
          "customer_growth",
          "고객 수도 함께 증가",
          "고객 기반이 넓어지는 회사를 원해요.",
        ),
        option(
          "retention",
          "기존 고객이 더 많이 씀",
          "제품 만족도와 확장을 우선해요.",
        ),
        option("margin", "이익률도 함께 개선", "질 좋은 성장을 원해요."),
        option(
          "revenue_only",
          "매출 성장만 보면 됨",
          "성장의 질은 후보별로 확인해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "horizon",
      text: "얼마나 오래 기다릴 수 있나요?",
      help: "보유 기간이 짧을수록 실적 변동의 영향이 커져요.",
      bucket: "prefer",
      options: [
        option("horizon_1", "1년 안팎", "단기 실적 확인이 중요해요."),
        option("horizon_3", "3년 정도", "성장 투자에 일반적인 기간이에요."),
        option("horizon_5", "5년 이상", "장기 시장 확대를 우선해요."),
        option(
          "horizon_unknown",
          "아직 정하지 않음",
          "기간으로 후보를 좁히지 않아요.",
        ),
      ],
    },
  ],
  quality: [
    {
      key: "profitHistory",
      text: "돈을 얼마나 꾸준히 벌어야 하나요?",
      help: "한 번의 흑자보다 반복 가능한 수익을 확인해요.",
      bucket: "prefer",
      options: [
        option(
          "profit_5y",
          "5년 이상 꾸준히",
          "경기 변화도 버틴 회사를 우선해요.",
        ),
        option("profit_3y", "3년 이상 꾸준히", "최근 사업 안정성을 확인해요."),
        option("profit_1y", "최근 1년이면 됨", "새로 좋아진 회사도 포함해요."),
        option(
          "profit_turn",
          "최근 흑자 전환도 포함",
          "변화 폭이 큰 후보까지 포함해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "cashFlow",
      text: "장부상 이익보다 실제 현금도 중요할까요?",
      help: "영업으로 들어오는 현금이 이익을 뒷받침하는지 봐요.",
      bucket: "pending",
      options: [
        option(
          "fcf_positive",
          "현금도 꾸준히 남아야 함",
          "잉여현금흐름이 양수인 회사를 원해요.",
        ),
        option(
          "ocf_positive",
          "영업 현금만 들어오면 됨",
          "투자 지출이 큰 회사도 포함해요.",
        ),
        option(
          "profit_enough",
          "회계상 이익이면 됨",
          "현금 전환 위험을 더 감수해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "balance",
      text: "빚과 현금은 어디까지 볼까요?",
      help: "불황에도 버틸 수 있는 재무 여유를 정해요.",
      bucket: "pending",
      options: [
        option(
          "net_cash",
          "빚보다 현금이 많아야 함",
          "순현금 회사를 우선해요.",
        ),
        option("low_debt", "빚이 적으면 됨", "안정적인 부채는 허용해요."),
        option(
          "debt_service",
          "이자를 잘 내면 됨",
          "현금흐름으로 감당 가능한 빚을 허용해요.",
        ),
        option("debt_any", "상관없음", "재무 구조로 제한하지 않아요."),
        unknown(),
      ],
    },
    {
      key: "stability",
      text: "실적이 흔들려도 괜찮나요?",
      help: "경기 민감 회사와 반복 매출 회사를 구분해요.",
      bucket: "prefer",
      options: [
        option(
          "very_stable",
          "매년 거의 흔들리지 않아야 함",
          "예측 가능성을 최우선으로 봐요.",
        ),
        option(
          "some_cycle",
          "한두 해는 흔들려도 됨",
          "일반적인 경기 변동은 허용해요.",
        ),
        option(
          "cyclical_ok",
          "경기 민감해도 됨",
          "평균 수익성을 더 중요하게 봐요.",
        ),
        unknown(),
      ],
    },
  ],
  value: [
    {
      key: "cheapBasis",
      text: "무엇과 비교해 싸야 하나요?",
      help: "‘싸다’는 비교 기준이 없으면 의미가 없어요.",
      bucket: "pending",
      options: [
        option(
          "history_price",
          "자기 과거 가격보다",
          "과거 평가 수준으로 돌아갈 가능성을 봐요.",
        ),
        option("peers", "비슷한 회사보다", "동종 업계 안에서 저평가를 찾아요."),
        option("earnings", "회사가 버는 돈보다", "이익 대비 가격을 봐요."),
        option(
          "cashflow",
          "실제 남기는 현금보다",
          "현금흐름 대비 가격을 봐요.",
        ),
        unknown(),
      ],
    },
    {
      key: "pe",
      text: "회사가 1년간 번 돈의 몇 배까지 낼까요?",
      help: "현재 가격을 최근 네 분기 주당이익으로 나눈 PER을 실제 검색에 적용해요.",
      bucket: "must",
      options: [
        option("pe_15", "15배 이하", "가격을 엄격하게 봐요."),
        option("pe_25", "25배 이하", "가격과 성장의 균형을 봐요."),
        option(
          "pe_40",
          "40배 이하",
          "빠르게 크는 회사의 높은 가격도 일부 허용해요.",
        ),
        option("pe_any", "제한하지 않음", "PER로 후보를 줄이지 않아요."),
        unknown(),
      ],
    },
    {
      key: "qualityFloor",
      text: "싸더라도 이것만은 지켜야 한다면?",
      help: "싼 회사가 계속 싼 가치 함정을 피하는 질문이에요.",
      bucket: "prefer",
      options: [
        option("quality_profit", "계속 흑자", "현재 수익성을 안전선으로 둬요."),
        option(
          "quality_growth",
          "매출이 줄지 않음",
          "사업 축소 회사를 피하고 싶어요.",
        ),
        option("quality_cash", "현금이 충분함", "생존 가능성을 우선해요."),
        option(
          "quality_none",
          "특별한 제한 없음",
          "턴어라운드 위험을 감수해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "catalyst",
      text: "다시 평가받을 계기가 있어야 할까요?",
      help: "싼 상태가 오래 이어질 가능성을 줄이는 질문이에요.",
      bucket: "pending",
      options: [
        option(
          "catalyst_earnings",
          "실적 회복이 보여야 함",
          "숫자로 확인되는 변화를 원해요.",
        ),
        option(
          "catalyst_product",
          "신제품이나 시장 확대",
          "사업 변화 계기를 원해요.",
        ),
        option(
          "catalyst_buyback",
          "자사주 매입이나 부채 축소",
          "주주 가치 개선을 원해요.",
        ),
        option(
          "catalyst_none",
          "없어도 기다릴 수 있음",
          "긴 대기 기간을 감수해요.",
        ),
        unknown(),
      ],
    },
  ],
  dividend: [
    {
      key: "dividendYears",
      text: "배당을 얼마나 오래 줬어야 하나요?",
      help: "회사 보고서에서 확인되는 연속 배당 기록을 실제 검색에 적용해요.",
      bucket: "must",
      options: [
        option("dividend_3", "3년 이상", "최근 배당을 시작한 회사도 포함해요."),
        option("dividend_5", "5년 이상", "한 경기 구간의 기록을 확인해요."),
        option("dividend_10", "10년 이상", "장기 지급 기록을 원해요."),
        option("dividend_20", "20년 이상", "매우 검증된 배당 기록을 원해요."),
        unknown(),
      ],
    },
    {
      key: "dividendCut",
      text: "배당을 줄인 적이 있으면 제외할까요?",
      help: "위기 때 배당을 지킨 기록을 확인해요.",
      bucket: "pending",
      options: [
        option("cut_never", "한 번이라도 줄였으면 제외", "가장 엄격하게 봐요."),
        option("cut_10y", "최근 10년만 유지", "오래된 감액은 허용해요."),
        option("cut_5y", "최근 5년만 유지", "최근 운영을 더 중요하게 봐요."),
        option("cut_ok", "감액 경험도 괜찮음", "회복 가능성을 따로 확인해요."),
        unknown(),
      ],
    },
    {
      key: "yield",
      text: "원하는 배당률은 어느 정도인가요?",
      help: "최근 연간 배당금을 현재 가격으로 나눠 실제 검색에 적용해요.",
      bucket: "must",
      options: [
        option("yield_2", "2% 이상", "배당 성장 회사도 넓게 포함해요."),
        option("yield_3", "3% 이상", "수익과 성장의 균형을 봐요."),
        option("yield_4", "4% 이상", "지급 여력을 한 번 더 확인해요."),
        option("yield_6", "6% 이상", "감액 위험을 매우 꼼꼼히 봐야 해요."),
        unknown(),
      ],
    },
    {
      key: "payout",
      text: "높은 배당이 실제로 유지 가능한지 얼마나 엄격히 볼까요?",
      help: "번 돈보다 많이 지급하면 배당이 줄 수 있어요.",
      bucket: "pending",
      when: { key: "yield", values: ["yield_4", "yield_6"] },
      options: [
        option(
          "payout_60",
          "이익의 60% 이하만 지급",
          "지급 여력을 보수적으로 봐요.",
        ),
        option("payout_80", "80% 이하", "성숙 기업의 높은 지급도 허용해요."),
        option(
          "payout_fcf",
          "현금흐름으로 감당하면 됨",
          "회계 이익보다 현금을 봐요.",
        ),
        unknown(),
      ],
    },
    {
      key: "dividendGrowth",
      text: "배당금도 매년 늘어야 하나요?",
      help: "현재 배당률과 미래 배당 성장 중 무엇을 우선할지 정해요.",
      bucket: "pending",
      options: [
        option(
          "div_growth_10",
          "매년 10% 이상 증가",
          "낮은 현재 수익률도 허용해요.",
        ),
        option(
          "div_growth_5",
          "매년 5% 이상 증가",
          "물가보다 빠른 성장을 원해요.",
        ),
        option("div_growth_0", "유지만 하면 됨", "현재 현금 수익을 우선해요."),
        unknown(),
      ],
    },
  ],
  emerging: [
    {
      key: "companySize",
      text: "회사 크기의 최대 범위는 어디까지 볼까요?",
      help: "주식 수와 현재 가격으로 계산한 회사 크기를 실제 검색에 적용해요.",
      bucket: "must",
      options: [
        option("cap_micro", "3억 달러 이하", "아주 작은 회사만 봐요."),
        option("cap_small", "20억 달러 이하", "소형 회사까지 봐요."),
        option("cap_mid", "100억 달러 이하", "중형 회사까지 봐요."),
        option("cap_any", "크기는 상관없음", "회사 크기로 제한하지 않아요."),
        unknown(),
      ],
    },
    {
      key: "adoption",
      text: "시장이 제품을 받아들이는 증거는 무엇이면 될까요?",
      help: "이야기가 아니라 실제 사용 증가를 확인해요.",
      bucket: "prefer",
      options: [
        option(
          "adoption_customers",
          "고객 수 증가",
          "사용자 기반 확대를 원해요.",
        ),
        option(
          "adoption_repeat",
          "재구매나 유지율 상승",
          "제품 만족도를 더 중요하게 봐요.",
        ),
        option(
          "adoption_revenue",
          "매출 증가면 충분",
          "확인 가능한 매출을 기준으로 삼아요.",
        ),
        option(
          "adoption_contract",
          "큰 계약 하나도 포함",
          "고객 집중 위험을 감수해요.",
        ),
        unknown(),
      ],
    },
    {
      key: "concentration",
      text: "몇몇 큰 고객에 의존해도 괜찮나요?",
      help: "큰 고객 하나를 잃으면 실적이 급변할 수 있어요.",
      bucket: "pending",
      options: [
        option(
          "concentration_low",
          "고객이 넓게 퍼져야 함",
          "한 고객의 영향이 작은 회사를 원해요.",
        ),
        option(
          "concentration_20",
          "한 고객 20% 이하면 됨",
          "일부 집중은 허용해요.",
        ),
        option("concentration_any", "초기라면 괜찮음", "성장 속도를 우선해요."),
        unknown(),
      ],
    },
    {
      key: "catalyst",
      text: "앞으로 확인할 중요한 사건이 있어야 하나요?",
      help: "막연한 기대보다 다음 검증 시점을 정해요.",
      bucket: "pending",
      options: [
        option(
          "catalyst_earnings",
          "다음 실적 발표",
          "매출과 현금 변화를 확인해요.",
        ),
        option(
          "catalyst_launch",
          "제품 출시나 승인",
          "실행 일정이 있는 회사를 원해요.",
        ),
        option(
          "catalyst_contract",
          "고객 계약 확대",
          "수요 확인 사건을 원해요.",
        ),
        option(
          "catalyst_none",
          "특별한 사건은 없어도 됨",
          "장기 실행을 기다려요.",
        ),
        unknown(),
      ],
    },
  ],
};

export function inferIntent(query: string): IntentId | null {
  if (/배당|현금 지급/.test(query)) return "dividend";
  if (/떨어|하락|낙폭|싸진|과하게 맞/.test(query)) return "fallen";
  if (/저평가|싼|가치|할인/.test(query)) return "value";
  if (/소형|작은 회사|초기|덜 알려/.test(query)) return "emerging";
  if (/빚|튼튼|안전|흑자|돈.*벌|재무/.test(query)) return "quality";
  if (/성장|커지|매출/.test(query)) return "growth";
  return null;
}

export function getQuestions(intent: IntentId, answers: ConversationAnswers) {
  return [...questionsByIntent[intent], ...commonQuestions].filter(
    (question) =>
      !question.when ||
      question.when.values.includes(answers[question.when.key]),
  );
}

export function buildScreeningProfile(
  query: string,
  intent: IntentId,
  answers: ConversationAnswers,
): { profile: ScreeningProfile; filters: Partial<Filters> } {
  const rules: Record<RuleBucket, string[]> = {
    must: [],
    prefer: [],
    pending: [],
  };
  const filters: Partial<Filters> = {};
  let unknownCount = 0;

  for (const question of getQuestions(intent, answers)) {
    const selected = question.options.find(
      (item) => item.value === answers[question.key],
    );
    if (!selected) continue;
    Object.assign(filters, selected.filters);
    if (!selected.rule) unknownCount += 1;
    else if (
      automaticallyAppliedQuestions.has(question.key) &&
      selected.bucket !== "pending"
    ) {
      rules.must.push(selected.rule);
    } else {
      rules.pending.push(selected.rule);
    }
  }

  return {
    filters,
    profile: {
      query,
      intentId: intent,
      intentTitle: intents.find((item) => item.id === intent)?.title ?? intent,
      answers: { ...answers },
      must: rules.must,
      prefer: rules.prefer,
      pending: rules.pending,
      answeredCount: Object.keys(answers).length,
      unknownCount,
    },
  };
}
