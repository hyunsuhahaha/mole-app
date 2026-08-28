export type RiskLevel = "stable" | "balanced" | "aggressive";

export type RiskProfile = {
  level: RiskLevel;
  title: string;
  score: number;
  summary: string;
  answers: Record<string, string>;
};

export type RiskQuestion = {
  key: string;
  text: string;
  help: string;
  options: { value: string; label: string; note: string; score: number }[];
};

export const riskQuestions: RiskQuestion[] = [
  {
    key: "moneyTiming",
    text: "이 돈을 언제 다시 써야 하나요?",
    help: "가까운 시일에 쓸 돈일수록 주가가 회복될 때까지 기다리기 어려워요.",
    options: [
      { value: "soon", label: "1년 안에 쓸 수도 있어요", note: "생활비나 큰 지출에 필요할 수 있어요.", score: 0 },
      { value: "mid", label: "3년 정도는 안 써요", note: "중간 정도의 기다림은 가능해요.", score: 1 },
      { value: "long", label: "5년 넘게 안 써도 돼요", note: "오래 기다릴 수 있는 여유 자금이에요.", score: 2 },
    ],
  },
  {
    key: "lossReaction",
    text: "산 주식이 30% 떨어지면 어떻게 할 것 같나요?",
    help: "수익 기대보다 실제 하락을 버틸 수 있는지가 더 중요해요.",
    options: [
      { value: "sell", label: "불안해서 대부분 팔 것 같아요", note: "큰 하락을 피하는 조건이 우선이에요.", score: 0 },
      { value: "wait", label: "이유를 확인하고 기다려요", note: "좋은 회사라면 회복을 기다릴 수 있어요.", score: 1 },
      { value: "buy", label: "회사가 멀쩡하면 더 살 수 있어요", note: "큰 가격 변동을 감수할 수 있어요.", score: 2 },
    ],
  },
  {
    key: "priority",
    text: "무엇을 가장 놓치고 싶지 않나요?",
    help: "모든 조건을 동시에 얻기는 어려워서 우선순위를 정해요.",
    options: [
      { value: "protect", label: "내 돈을 크게 잃지 않는 것", note: "흑자와 재무 안전을 먼저 봐요.", score: 0 },
      { value: "balance", label: "안정과 성장의 균형", note: "검증된 성장 회사를 넓게 봐요.", score: 1 },
      { value: "growth", label: "큰 성장 기회를 놓치지 않는 것", note: "적자나 큰 변동도 일부 허용해요.", score: 2 },
    ],
  },
  {
    key: "companyStage",
    text: "아직 돈을 못 버는 작은 회사도 볼까요?",
    help: "초기 회사는 크게 성장할 수 있지만 실패 가능성도 더 높아요.",
    options: [
      { value: "avoid", label: "아니요, 지금 돈 버는 회사만", note: "확인된 사업을 우선해요.", score: 0 },
      { value: "some", label: "일부만 섞어도 괜찮아요", note: "안정적인 후보와 함께 비교해요.", score: 1 },
      { value: "allow", label: "네, 초기 성장 회사를 찾고 싶어요", note: "성공 가능성과 생존 자금을 함께 봐요.", score: 2 },
    ],
  },
  {
    key: "experience",
    text: "주가가 크게 오르내린 경험이 있나요?",
    help: "경험이 적다면 처음부터 너무 센 조건을 권하지 않아요.",
    options: [
      { value: "none", label: "거의 처음이에요", note: "설명과 안전 조건을 더 많이 보여드려요.", score: 0 },
      { value: "some", label: "몇 번 겪어봤어요", note: "위험과 기회를 함께 비교해요.", score: 1 },
      { value: "often", label: "여러 번 겪고도 투자했어요", note: "변동이 큰 후보까지 볼 수 있어요.", score: 2 },
    ],
  },
];

export function calculateRiskProfile(answers: Record<string, string>): RiskProfile {
  let score = riskQuestions.reduce((total, question) => {
    const selected = question.options.find((option) => option.value === answers[question.key]);
    return total + (selected?.score ?? 0);
  }, 0);

  // 곧 써야 할 돈은 다른 답이 공격적이어도 안정형으로 제한해요.
  if (answers.moneyTiming === "soon") score = Math.min(score, 3);
  // 큰 하락에서 바로 팔 가능성이 높다면 공격형으로 분류하지 않아요.
  if (answers.lossReaction === "sell") score = Math.min(score, 7);

  if (score <= 3) {
    return { level: "stable", title: "안정 탐색형", score, summary: "큰 손실을 피하도록 지금 돈을 버는 회사와 재무 여유를 먼저 볼게요.", answers };
  }
  if (score <= 7) {
    return { level: "balanced", title: "균형 탐색형", score, summary: "안정성과 성장 가능성을 한쪽에 치우치지 않게 비교할게요.", answers };
  }
  return { level: "aggressive", title: "공격 탐색형", score, summary: "큰 변동을 감수하고 초기 성장 기회까지 보되 생존 위험을 강하게 표시할게요.", answers };
}

export const intentOrderByRisk: Record<RiskLevel, string[]> = {
  stable: ["quality", "dividend", "value", "growth", "fallen", "emerging"],
  balanced: ["growth", "quality", "value", "dividend", "fallen", "emerging"],
  aggressive: ["emerging", "growth", "fallen", "value", "quality", "dividend"],
};
