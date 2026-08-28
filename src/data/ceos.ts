export type CeoStatement = {
  date: string;
  sourceType: "실적발표" | "공식 발표";
  headline: string;
  summary: string;
  fact: string;
  related: string[];
  source: string;
};

export type CeoLens = {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  company: string;
  ticker: string;
  statement: CeoStatement;
};

export const ceos: CeoLens[] = [
  {
    id: "jensen-huang", name: "젠슨 황", nameEn: "Jensen Huang", role: "창업자·CEO", company: "NVIDIA", ticker: "NVDA",
    statement: {
      date: "2026-08-26", sourceType: "실적발표", headline: "AI 컴퓨팅 수요가 더 빨라지고 있다고 봤어요",
      summary: "AI 연구소와 스타트업, 오픈 모델, 로봇 AI가 동시에 컴퓨팅 수요를 키우고 있다고 설명했어요.",
      fact: "분기 매출 962억 달러 · 전년 대비 106% 증가", related: ["NVDA", "AI 반도체", "데이터센터"],
      source: "https://nvidianews.nvidia.com/news/nvidia-announces-financial-results-for-second-quarter-fiscal-2027",
    },
  },
  {
    id: "lisa-su", name: "리사 수", nameEn: "Lisa Su", role: "CEO", company: "AMD", ticker: "AMD",
    statement: {
      date: "2026-08-04", sourceType: "실적발표", headline: "AI가 장기적인 컴퓨팅 수요를 키운다고 봤어요",
      summary: "EPYC 수요와 Instinct 도입이 커지는 흐름을 근거로 AI 시장을 장기 성장 기회로 제시했어요.",
      fact: "분기 매출 115억 달러 · 데이터센터 매출 2배 이상 증가", related: ["AMD", "AI 가속기", "데이터센터"],
      source: "https://ir.amd.com/news-events/press-releases/detail/1295/amd-reports-second-quarter-2026-financial-results",
    },
  },
  {
    id: "satya-nadella", name: "사티아 나델라", nameEn: "Satya Nadella", role: "회장·CEO", company: "Microsoft", ticker: "MSFT",
    statement: {
      date: "2026-07-29", sourceType: "실적발표", headline: "AI를 실제 업무 성과로 바꾸는 단계라고 봤어요",
      summary: "Azure와 Copilot의 유료 사용 증가를 근거로 기업의 AI 도입이 실험 단계를 넘고 있다고 설명했어요.",
      fact: "Azure 연 매출 1,000억 달러 돌파 · Copilot 유료 좌석 3,000만+", related: ["MSFT", "Azure", "Copilot"],
      source: "https://www.microsoft.com/en-us/investor/earnings/fy-2026-q4/press-release-webcast",
    },
  },
  {
    id: "elon-musk", name: "일론 머스크", nameEn: "Elon Musk", role: "CEO", company: "Tesla", ticker: "TSLA",
    statement: {
      date: "2026-07-22", sourceType: "실적발표", headline: "로보택시와 로봇 투자를 더 키우겠다고 했어요",
      summary: "분기 실적 설명에서 로보택시 확장과 AI 컴퓨팅, Optimus 투자를 핵심 방향으로 제시했어요.",
      fact: "분기 생산 451,758대 · 인도 480,126대", related: ["TSLA", "로보택시", "Optimus"],
      source: "https://ir.tesla.com/",
    },
  },
];

export const recentCeos = [...ceos].sort((a, b) => b.statement.date.localeCompare(a.statement.date));
export function formatStatementDate(value: string) { return value.replace(/-/g, "."); }
