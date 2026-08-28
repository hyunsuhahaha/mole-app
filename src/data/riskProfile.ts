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
    text: "언제 다시 쓸 돈인가요?",
    help: "오래 기다릴 수 있는지 알려주세요.",
    options: [
      {
        value: "soon",
        label: "1년 안에 쓸 수 있어요",
        note: "곧 필요한 돈이에요",
        score: 0,
      },
      {
        value: "mid",
        label: "3년은 안 써요",
        note: "조금 기다릴 수 있어요",
        score: 1,
      },
      {
        value: "long",
        label: "5년 넘게 안 써요",
        note: "오래 기다릴 수 있어요",
        score: 2,
      },
    ],
  },
  {
    key: "lossReaction",
    text: "주가가 30% 떨어지면 어떨까요?",
    help: "가장 가까운 답을 골라주세요.",
    options: [
      {
        value: "sell",
        label: "대부분 팔 것 같아요",
        note: "큰 하락이 부담돼요",
        score: 0,
      },
      {
        value: "wait",
        label: "확인하고 기다려요",
        note: "회복을 기다릴 수 있어요",
        score: 1,
      },
      {
        value: "buy",
        label: "문제가 없다면 더 사요",
        note: "큰 변동도 괜찮아요",
        score: 2,
      },
    ],
  },
  {
    key: "priority",
    text: "무엇을 가장 놓치고 싶지 않나요?",
    help: "가장 중요한 하나를 골라주세요.",
    options: [
      {
        value: "protect",
        label: "큰 손실을 피하는 것",
        note: "안정성을 먼저 봐요",
        score: 0,
      },
      {
        value: "balance",
        label: "안정과 성장의 균형",
        note: "검증된 성장 회사를 넓게 봐요.",
        score: 1,
      },
      {
        value: "growth",
        label: "큰 성장 기회를 잡는 것",
        note: "변동을 감수해요",
        score: 2,
      },
    ],
  },
  {
    key: "companyStage",
    text: "적자인 성장주도 볼까요?",
    help: "위험은 더 크지만 후보가 넓어져요.",
    options: [
      {
        value: "avoid",
        label: "흑자 회사만 볼래요",
        note: "안정성을 우선해요",
        score: 0,
      },
      {
        value: "some",
        label: "일부는 괜찮아요",
        note: "함께 비교해요",
        score: 1,
      },
      {
        value: "allow",
        label: "적자여도 괜찮아요",
        note: "성장을 우선해요",
        score: 2,
      },
    ],
  },
  {
    key: "experience",
    text: "주식 투자가 익숙한가요?",
    help: "지금 경험에 맞춰 설명할게요.",
    options: [
      {
        value: "none",
        label: "거의 처음이에요",
        note: "쉽게 설명해 주세요",
        score: 0,
      },
      {
        value: "some",
        label: "조금 해봤어요",
        note: "기본은 알고 있어요",
        score: 1,
      },
      {
        value: "often",
        label: "익숙해요",
        note: "변동도 경험했어요",
        score: 2,
      },
    ],
  },
];

export function calculateRiskProfile(
  answers: Record<string, string>,
): RiskProfile {
  let score = riskQuestions.reduce((total, question) => {
    const selected = question.options.find(
      (option) => option.value === answers[question.key],
    );
    return total + (selected?.score ?? 0);
  }, 0);

  // 곧 써야 할 돈은 다른 답이 공격적이어도 안정형으로 제한해요.
  if (answers.moneyTiming === "soon") score = Math.min(score, 3);
  // 큰 하락에서 바로 팔 가능성이 높다면 공격형으로 분류하지 않아요.
  if (answers.lossReaction === "sell") score = Math.min(score, 7);

  if (score <= 3) {
    return {
      level: "stable",
      title: "안정 탐색형",
      score,
      summary:
        "큰 손실을 피하도록 지금 돈을 버는 회사와 재무 여유를 먼저 볼게요.",
      answers,
    };
  }
  if (score <= 7) {
    return {
      level: "balanced",
      title: "균형 탐색형",
      score,
      summary: "안정성과 성장 가능성을 한쪽에 치우치지 않게 비교할게요.",
      answers,
    };
  }
  return {
    level: "aggressive",
    title: "공격 탐색형",
    score,
    summary:
      "큰 변동을 감수하고 초기 성장 기회까지 보되 생존 위험을 강하게 표시할게요.",
    answers,
  };
}

export const intentOrderByRisk: Record<RiskLevel, string[]> = {
  stable: ["quality", "dividend", "value", "growth", "fallen", "emerging"],
  balanced: ["growth", "quality", "value", "dividend", "fallen", "emerging"],
  aggressive: ["emerging", "growth", "fallen", "value", "quality", "dividend"],
};
