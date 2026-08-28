import type { Filters } from "../store/useDigStore";

export type PerformancePeriod = "oneYear" | "fiveYear" | "longTerm";

export type Investor = {
  id: string;
  name: string;
  nameEn: string;
  vehicle: string;
  style: string;
  summary: string;
  sectors: string[];
  lens: string[];
  filterPreset: Partial<Filters>;
  holdings: { ticker: string; company: string; weight?: string }[];
  holdingsAsOf: string;
  holdingsNote: string;
  holdingsSource: string;
  ideas: {
    date: string;
    sourceType: "X" | "주주서한" | "인터뷰" | "발표";
    title: string;
    summary: string;
    related: string[];
    source: string;
  }[];
  performance: Record<PerformancePeriod, number>;
  performanceAsOf: string;
  performanceLabels: Record<PerformancePeriod, string>;
  performanceNote: string;
  performanceSource: string;
};

export const performancePeriods: {
  key: PerformancePeriod;
  label: string;
}[] = [
  { key: "oneYear", label: "1년" },
  { key: "fiveYear", label: "5년" },
  { key: "longTerm", label: "장기" },
];

export const investors: Investor[] = [
  {
    id: "warren-buffett",
    name: "워런 버핏",
    nameEn: "Warren Buffett",
    vehicle: "Berkshire Hathaway",
    style: "좋은 회사를 오래 보유",
    summary:
      "이해하기 쉬운 사업, 오래가는 경쟁력, 꾸준한 현금 창출력을 먼저 봐요.",
    sectors: ["금융", "필수소비재", "에너지", "보험"],
    lens: ["꾸준한 이익", "강한 현금흐름", "낮은 부채 부담", "오래가는 경쟁력"],
    filterPreset: {
      style: "꾸준히 버는 회사",
      cap: "큰 회사",
      growth: "10% 이상",
      horizon: "5년 이상",
      lossAllowed: "제외",
      catalyst: "있으면 가점",
    },
    holdings: [
      { ticker: "AAPL", company: "Apple" },
      { ticker: "AXP", company: "American Express" },
      { ticker: "KO", company: "Coca-Cola" },
      { ticker: "MCO", company: "Moody's" },
    ],
    holdingsAsOf: "2025-12-31",
    holdingsNote: "Berkshire 연차보고서에 공개된 주요 상장주식",
    holdingsSource:
      "https://www.berkshirehathaway.com/letters/2025ltr.pdf",
    ideas: [
      {
        date: "2025-12-31",
        sourceType: "주주서한",
        title: "일본 종합상사를 장기 핵심 투자로 봐요",
        summary:
          "미쓰비시, 이토추, 미쓰이, 마루베니, 스미토모를 미국 핵심 보유기업과 비슷한 장기 가치 창출 기회로 설명했어요.",
        related: ["일본 종합상사", "에너지", "산업재"],
        source: "https://www.berkshirehathaway.com/letters/2025ltr.pdf",
      },
      {
        date: "2025-12-31",
        sourceType: "주주서한",
        title: "보험은 Berkshire의 중심으로 남아요",
        summary:
          "보험 산업의 가격 환경은 흔들릴 수 있지만 구조적 강점과 장기 성장성은 계속된다고 봤어요.",
        related: ["보험", "현금흐름"],
        source: "https://www.berkshirehathaway.com/letters/2025ltr.pdf",
      },
    ],
    performance: { oneYear: 10.9, fiveYear: 16.8, longTerm: 19.7 },
    performanceAsOf: "2025-12-31",
    performanceLabels: {
      oneYear: "2025 연간",
      fiveYear: "최근 5년 연복리",
      longTerm: "1965-2025 연복리",
    },
    performanceNote:
      "Berkshire 주당 시장가치 기준입니다. 5년 값은 공식 연간 수익률로 계산했어요.",
    performanceSource:
      "https://www.berkshirehathaway.com/letters/2025ltr.pdf",
  },
  {
    id: "cathie-wood",
    name: "캐시 우드",
    nameEn: "Cathie Wood",
    vehicle: "ARK Innovation ETF",
    style: "세상을 바꿀 혁신에 집중",
    summary:
      "AI, 자율주행, 유전체처럼 시장 구조를 바꿀 기술의 5년 성장성을 봐요.",
    sectors: ["AI", "자율주행", "정밀의료", "디지털 금융"],
    lens: ["큰 시장 기회", "높은 연구개발", "기술 변화", "5년 성장 가능성"],
    filterPreset: {
      style: "빠르게 크는 회사",
      industry: "기술",
      cap: "중간 회사",
      growth: "25% 이상",
      horizon: "5년 이상",
      lossAllowed: "포함",
      catalyst: "꼭 있어야 함",
    },
    holdings: [
      { ticker: "TSLA", company: "Tesla", weight: "9.42%" },
      { ticker: "SPCX", company: "SpaceX", weight: "4.92%" },
      { ticker: "TEM", company: "Tempus AI", weight: "4.81%" },
      { ticker: "CRSP", company: "CRISPR Therapeutics", weight: "4.66%" },
    ],
    holdingsAsOf: "2026-07-31",
    holdingsNote: "ARKK 공식 일별 보유종목 중 상위 공개 종목",
    holdingsSource: "https://www.ark-funds.com/funds/arkk",
    ideas: [
      {
        date: "2025-11-04",
        sourceType: "X",
        title: "Tesla의 자체 AI 칩을 중요하게 봐요",
        summary:
          "Tesla가 설계하는 차세대 AI 칩이 자율주행과 로봇 확장의 중요한 기반이 될 수 있다는 관점을 공유했어요.",
        related: ["TSLA", "AI 반도체", "자율주행"],
        source: "https://x.com/CathieDWood/status/1985762139022196897",
      },
      {
        date: "2026-03-31",
        sourceType: "발표",
        title: "로보택시와 정밀의료를 큰 혁신 축으로 봐요",
        summary:
          "ARK 분기 보고서에서 자율주행, AI, 유전체 기술을 장기 성장 테마로 계속 추적했어요.",
        related: ["TSLA", "TEM", "CRSP"],
        source:
          "https://etfs.ark-funds.com/hubfs/2_Download_Files_For_ARK_Funds/Reports/ARK_ETF_Trust_Quarterly_Report.pdf",
      },
    ],
    performance: { oneYear: 14.82, fiveYear: -9.05, longTerm: 13.63 },
    performanceAsOf: "2026-06-30",
    performanceLabels: {
      oneYear: "최근 1년 NAV",
      fiveYear: "5년 연환산 NAV",
      longTerm: "설정 이후 연환산 NAV",
    },
    performanceNote: "ARKK NAV 총수익률 기준입니다.",
    performanceSource: "https://www.ark-funds.com/funds/arkk",
  },
  {
    id: "bill-ackman",
    name: "빌 애크먼",
    nameEn: "Bill Ackman",
    vehicle: "Pershing Square Holdings",
    style: "소수의 강한 아이디어에 집중",
    summary:
      "질 좋은 대형주를 적게 고르고, 경영과 자본 배분이 좋아질 여지를 살펴봐요.",
    sectors: ["기술", "금융", "소비자 서비스", "부동산"],
    lens: ["예측 가능한 현금", "높은 진입장벽", "가격 결정력", "개선 가능한 경영"],
    filterPreset: {
      style: "꾸준히 버는 회사",
      cap: "큰 회사",
      growth: "15% 이상",
      horizon: "3–5년",
      lossAllowed: "제외",
      catalyst: "꼭 있어야 함",
    },
    holdings: [
      { ticker: "META", company: "Meta Platforms" },
      { ticker: "AMZN", company: "Amazon" },
      { ticker: "UBER", company: "Uber" },
      { ticker: "BN", company: "Brookfield" },
    ],
    holdingsAsOf: "2026-02-28",
    holdingsNote: "Pershing Square 공식 팩트시트의 공개 포트폴리오",
    holdingsSource:
      "https://pershingsquareholdings.com/portfolio/",
    ideas: [
      {
        date: "2025-11-18",
        sourceType: "X",
        title: "Fannie Mae와 Freddie Mac 정상화에 베팅해요",
        summary:
          "정부 관리 종료와 민간 시장 복귀가 두 회사의 장기 가치를 크게 바꿀 수 있다는 투자 논리를 공개 발표했어요.",
        related: ["FNMA", "FMCC", "주택금융"],
        source: "https://x.com/i/broadcasts/1yNGabqBylbJj",
      },
      {
        date: "2026-02-18",
        sourceType: "주주서한",
        title: "보험 기반 복리 회사를 만들려 해요",
        summary:
          "Howard Hughes Holdings를 보험과 우량기업 투자를 결합한 장기 복리형 지주회사로 키우는 구상을 밝혔어요.",
        related: ["HHH", "보험", "지주회사"],
        source:
          "https://assets.pershingsquareholdings.com/wp-content/uploads/2026/02/18175039/Pershing-Square-Holdings-Ltd.-2025-Annual-Report.pdf",
      },
    ],
    performance: { oneYear: 2.7, fiveYear: 10.4, longTerm: 12.4 },
    performanceAsOf: "2026-02-28",
    performanceLabels: {
      oneYear: "최근 1년 NAV",
      fiveYear: "5년 연환산 NAV",
      longTerm: "2012년 이후 연환산 NAV",
    },
    performanceNote: "Pershing Square Holdings NAV 기준입니다.",
    performanceSource:
      "https://pershingsquareholdings.com/performance/nav/",
  },
  {
    id: "terry-smith",
    name: "테리 스미스",
    nameEn: "Terry Smith",
    vehicle: "Fundsmith Equity Fund",
    style: "좋은 기업을 사고 아무것도 하지 않기",
    summary:
      "높은 자본수익률과 반복 매출을 가진 회사를 합리적인 가격에 오래 보유해요.",
    sectors: ["결제", "헬스케어", "소비재", "소프트웨어"],
    lens: ["높은 자본수익률", "반복되는 매출", "적은 부채", "변화에 강한 사업"],
    filterPreset: {
      style: "꾸준히 버는 회사",
      cap: "큰 회사",
      growth: "10% 이상",
      horizon: "5년 이상",
      lossAllowed: "제외",
      dilution: "많이 늘리면 제외",
    },
    holdings: [
      { ticker: "MA", company: "Mastercard" },
      { ticker: "SYK", company: "Stryker" },
      { ticker: "WAT", company: "Waters" },
      { ticker: "V", company: "Visa" },
    ],
    holdingsAsOf: "2026-07-31",
    holdingsNote: "Fundsmith 공식 월간 팩트시트의 상위 보유종목",
    holdingsSource: "https://www.fundsmith.co.uk/factsheet/",
    ideas: [
      {
        date: "2025-11-03",
        sourceType: "인터뷰",
        title: "Amadeus는 전환이 어려운 서비스라 봐요",
        summary:
          "고객 시스템에 깊이 연결돼 교체 비용이 낮지 않고, 장기 매출 성장에 비해 가격이 합리적이라는 관점을 밝혔어요.",
        related: ["AMS", "여행 소프트웨어"],
        source:
          "https://www.fundsmith.co.uk/news/2025/6539-expansion-interview-terry-smith-there-could-be-a-stock-market-bubble-more-extreme-than-the-one-in-2000/",
      },
      {
        date: "2025-11-03",
        sourceType: "인터뷰",
        title: "AI 기대만으로 오른 가격은 경계해요",
        summary:
          "AI 테마 자체보다 여러 사업에서 현금을 버는 Microsoft 같은 기업의 회복력을 더 중요하게 봤어요.",
        related: ["MSFT", "AI", "기업 소프트웨어"],
        source:
          "https://www.fundsmith.co.uk/news/2025/6539-expansion-interview-terry-smith-there-could-be-a-stock-market-bubble-more-extreme-than-the-one-in-2000/",
      },
    ],
    performance: { oneYear: -2.9, fiveYear: 5.4, longTerm: 13.1 },
    performanceAsOf: "2026-07-31",
    performanceLabels: {
      oneYear: "최근 12개월",
      fiveYear: "최근 5년 연복리",
      longTerm: "설정 이후 연환산",
    },
    performanceNote:
      "T Class 누적형 기준입니다. 1년과 5년 값은 공식 월별, 연간 수익률로 계산했어요.",
    performanceSource: "https://www.fundsmith.co.uk/factsheet/",
  },
];

export function formatReturn(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}
