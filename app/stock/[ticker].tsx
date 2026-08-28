import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { Mole } from "../../src/components/Mole";
import { researchApi, type MarketDataResponse } from "../../src/api/research";
import { useDigStore } from "../../src/store/useDigStore";
import { colors, spacing } from "../../src/theme/tokens";
import { goBackOr } from "../../src/navigation/goBackOr";
import {
  PriceCandlestickChart,
  RevenueBarChart,
} from "../../src/components/FinanceCharts";
export default function StockDetail() {
  const {
    ticker,
    market: marketScope,
    exchange,
    company,
  } = useLocalSearchParams<{
    ticker: string;
    market?: string;
    exchange?: string;
    company?: string;
  }>();
  const live = useDigStore((x) => x.results);
  const storedStock = live.find((x) => x.ticker === ticker);
  const detail = useQuery({
    queryKey: ["stock-detail", ticker],
    queryFn: () => researchApi.getStock(ticker),
    enabled: !!ticker && !storedStock && marketScope !== "KR",
    retry: 1,
    staleTime: 5 * 60_000,
  });
  const stock = storedStock ?? detail.data;
  const watchlist = useDigStore((x) => x.watchlist);
  const toggleWatchlist = useDigStore((x) => x.toggleWatchlist);
  const watched = !!ticker && watchlist.includes(ticker);
  const market = useQuery({
    queryKey: ["market-price", ticker],
    queryFn: () => researchApi.getMarketData(ticker, exchange || undefined),
    enabled: !!ticker,
    retry: false,
    staleTime: 60_000,
  });
  const [riskStep, setRiskStep] = useState(0),
    [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    setRiskStep(1);
    const a = setTimeout(() => setRiskStep(2), 900),
      b = setTimeout(() => setRiskStep(3), 1800),
      c = setTimeout(() => {
        setRiskStep(4);
        setRunning(false);
      }, 2700);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearTimeout(c);
    };
  }, [running]);
  if (marketScope === "KR") {
    return (
      <SafeAreaView style={s.page}>
        <View style={s.header}>
          <Pressable
            accessibilityLabel="뒤로 가기"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => goBackOr("/search")}
          >
            <Text style={s.back}>←</Text>
          </Pressable>
          <Text style={s.headerTitle}>국내 종목 가격</Text>
        </View>
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.identity}>
            <View>
              <Text style={s.ticker}>{ticker}</Text>
              <Text style={s.company}>{company ?? ticker}</Text>
            </View>
            <Text style={s.marketBadge}>{exchange || "KRX"}</Text>
          </View>
          <PricePanel
            data={market.data}
            loading={market.isLoading}
            unavailable={market.isError}
          />
          <Section
            label="지금 확인할 수 있는 범위"
            text="국내 상장 종목 목록과 가격 흐름을 확인했어요. 국내 기업의 매출·이익 조건 검색은 OpenDART 재무자료가 연결된 뒤에만 제공해 잘못된 후보를 만들지 않아요."
            accent
          />
          <Text style={s.domesticNotice}>
            가격 제공 범위는 종목별 데이터 이용 등급에 따라 다를 수 있어요.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }
  if (!stock) {
    return (
      <SafeAreaView style={s.page}>
        <View style={s.header}>
          <Pressable
            accessibilityLabel="뒤로 가기"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => goBackOr("/results")}
          >
            <Text style={s.back}>←</Text>
          </Pressable>
          <Text style={s.headerTitle}>쉬운 종목 설명</Text>
        </View>
        <View style={s.missing}>
          <Text style={s.missingTitle}>
            {detail.isLoading
              ? "회사 공시를 읽고 있어요"
              : "불러온 회사 자료가 없어요"}
          </Text>
          <Text style={s.missingText}>
            {detail.isLoading
              ? "매출, 이익과 주식 수 변화를 쉬운 말로 바꾸는 중이에요."
              : detail.error instanceof Error
                ? detail.error.message
                : "샘플 설명으로 대신하지 않았어요. 검색 결과에서 회사를 다시 선택해주세요."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  const finalScore = riskStep < 4 ? stock.preRiskScore : stock.score;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => goBackOr("/results")}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>쉬운 종목 설명</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleWatchlist(ticker)}
          style={[s.watch, watched && s.watchActive]}
        >
          <Text style={[s.watchText, watched && s.watchTextActive]}>
            {watched ? "관심 회사 ✓" : "+ 관심 회사"}
          </Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.identity}>
          <View>
            <Text style={s.ticker}>{stock.ticker}</Text>
            <Text style={s.company}>{stock.company}</Text>
          </View>
          <View style={s.score}>
            <Text style={s.scoreValue}>{finalScore}</Text>
            <Text style={s.scoreLabel}>
              {riskStep === 4 ? "위험 반영 일치도" : "조건 일치도"}
            </Text>
          </View>
        </View>
        <PricePanel
          data={market.data}
          loading={market.isLoading}
          unavailable={market.isError}
        />
        <Section
          label="무슨 회사인가요?"
          text={
            stock.business ??
            `${stock.company}가 하는 일은 최신 공시 원문에서 확인해주세요.`
          }
          accent
        />
        <Section label="왜 남았나요?" text={stock.whyFound} />
        {!!stock.revenueHistory?.length && (
          <RevenueChart data={stock.revenueHistory} />
        )}
        <Section label="가장 좋은 점" text={stock.strongestCase} />
        <View style={s.evidenceBlock}>
          <Text style={s.blockKicker}>실제 숫자와 출처</Text>
          <Text style={s.sourceNotice}>
            {stock.dataSource === "SEC EDGAR"
              ? "회사가 미국 정부에 직접 낸 실제 자료"
              : "연습용 예시 자료"}
          </Text>
          {stock.evidence.map((e) => (
            <Pressable
              accessibilityRole={e.url ? "link" : undefined}
              key={e.label}
              disabled={!e.url}
              onPress={() => e.url && Linking.openURL(e.url)}
              style={s.evidence}
            >
              <Text style={s.evidenceLabel}>{e.label}</Text>
              <Text style={s.evidenceValue}>{e.value}</Text>
              {e.explanation && (
                <Text
                  style={[
                    s.evidenceExplanation,
                    e.tone === "watch" && s.evidenceWatch,
                  ]}
                >
                  {e.explanation}
                </Text>
              )}
              <View style={s.source}>
                <Text style={s.sourceType}>{e.sourceType}</Text>
                <Text style={s.sourceText}>
                  {e.source}
                  {e.url ? " · 원문 열기 →" : ""}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
        <Section label="아쉬운 점" text={stock.penalty} />
        <View style={s.danger}>
          <Text style={s.dangerLabel}>이럴 땐 다시 봐야 해요</Text>
          <Text style={s.dangerText}>{stock.reversalEvent}</Text>
        </View>
        <View style={s.riskDig}>
          <View style={s.riskHead}>
            <View>
              <Text style={s.riskKicker}>한 번 더 의심해 보기</Text>
              <Text style={s.riskTitle}>위험 다시 파기</Text>
            </View>
            <Mole
              mood={running || riskStep > 0 ? "suspicious" : "idle"}
              size={112}
            />
          </View>
          {riskStep === 0 ? (
            <Pressable
              accessibilityRole="button"
              style={s.riskButton}
              onPress={() => setRunning(true)}
            >
              <Text style={s.riskButtonText}>
                좋은 점이 맞는지 다시 확인하기 →
              </Text>
            </Pressable>
          ) : (
            <View>
              {riskStep >= 1 && (
                <Animated.Text entering={FadeInDown} style={s.riskLine}>
                  초기 자료 일치도 {stock.preRiskScore}
                </Animated.Text>
              )}
              {stock.riskFindings.map(
                (finding, i) =>
                  riskStep >= i + 2 && (
                    <Animated.View
                      entering={FadeInDown}
                      key={finding}
                      style={s.finding}
                    >
                      <Text style={s.findingMark}>!</Text>
                      <Text style={s.findingText}>{finding}</Text>
                    </Animated.View>
                  ),
              )}
              {riskStep >= 4 && (
                <Animated.View entering={FadeIn} style={s.final}>
                  <Text style={s.finalLabel}>위험 반영 자료 일치도</Text>
                  <Text style={s.finalScore}>{stock.score}</Text>
                </Animated.View>
              )}
              {riskStep < 4 && (
                <Text style={s.checking}>숨은 위험을 다시 찾는 중…</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function PricePanel({
  data,
  loading,
  unavailable,
}: {
  data?: MarketDataResponse;
  loading: boolean;
  unavailable: boolean;
}) {
  if (loading)
    return (
      <View style={s.pricePanel}>
        <Text style={s.priceKicker}>시장 가격</Text>
        <Text style={s.priceStatus}>가격을 확인하고 있어요…</Text>
      </View>
    );
  if (unavailable || !data)
    return (
      <View style={s.pricePanel}>
        <Text style={s.priceKicker}>시장 가격</Text>
        <Text style={s.priceStatus}>현재 시세를 가져올 수 없어요</Text>
        <Text style={s.priceHelp}>
          무료 데이터 제공 범위 밖이거나 시세 서버가 잠시 응답하지 않았어요.
        </Text>
      </View>
    );
  const positive = data.change >= 0;
  const sign = positive ? "+" : "";
  const priceLabel =
    data.currency === "USD"
      ? `$${data.price.toFixed(2)}`
      : data.currency === "KRW"
        ? `₩${Math.round(data.price).toLocaleString()}`
        : `${data.price.toFixed(2)} ${data.currency}`;
  return (
    <View style={s.pricePanel} accessibilityRole="summary">
      <View style={s.priceHead}>
        <View>
          <Text style={s.priceKicker}>최근 확인 가격</Text>
          <Text style={s.priceValue}>{priceLabel}</Text>
        </View>
        <View style={s.priceChangeBox}>
          <Text style={[s.priceChange, !positive && s.priceDown]}>
            {sign}
            {data.change.toFixed(2)} · {sign}
            {data.percentChange.toFixed(2)}%
          </Text>
          <Text style={s.marketState}>
            {data.marketOpen ? "시장 열림" : "시장 닫힘"}
          </Text>
        </View>
      </View>
      <Text style={s.priceChartTitle}>주가 캔들차트</Text>
      {!!data.history.length && (
        <PriceCandlestickChart
          history={data.history}
          currency={data.currency}
        />
      )}
      <Text style={s.priceSource}>
        기준 {data.asOf ?? "시각 미확인"} · {data.source}
      </Text>
    </View>
  );
}
function RevenueChart({
  data,
}: {
  data: { period: string; value: number; display: string }[];
}) {
  return (
    <View style={s.chartBlock} accessibilityRole="summary">
      <Text style={s.chartKicker}>기업 실적 · 분기 매출</Text>
      <Text style={s.chartTitle}>매출이 실제로 커지고 있나요?</Text>
      <Text style={s.chartHelp}>
        이 막대는 주가가 아니라 회사가 3개월마다 올린 매출이에요. 회사가 같은
        기준으로 신고한 분기만 표시하며 단위는 달러예요.
      </Text>
      <RevenueBarChart data={data} />
    </View>
  );
}
function Section({
  label,
  text,
  accent = false,
}: {
  label: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <View style={[s.section, accent && s.sectionAccent]}>
      <Text style={s.sectionLabel}>{label}</Text>
      <Text style={s.sectionText}>{text}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: {
    marginHorizontal: spacing.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  back: { fontSize: 26, color: colors.ink },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.ink,
    marginLeft: 14,
  },
  watch: {
    marginLeft: "auto",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.line,
  },
  watchActive: { backgroundColor: colors.green, borderColor: colors.green },
  watchText: { fontSize: 9, fontWeight: "900", color: colors.green },
  watchTextActive: { color: colors.paper },
  step: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: spacing.lg,
    paddingBottom: 48,
  },
  missing: { padding: spacing.lg },
  missingTitle: { fontSize: 24, fontWeight: "900", color: colors.ink },
  missingText: {
    marginTop: 9,
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
  },
  identity: {
    flexDirection: "row",
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderColor: colors.ink,
  },
  ticker: { fontSize: 42, fontWeight: "900", color: colors.ink },
  company: { fontSize: 13, color: colors.muted },
  marketBadge: {
    marginLeft: "auto",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.green,
    color: colors.paper,
    fontSize: 10,
    fontWeight: "900",
  },
  domesticNotice: {
    marginTop: 16,
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
  },
  score: { marginLeft: "auto", alignItems: "flex-end" },
  scoreValue: { fontSize: 44, fontWeight: "900", color: colors.green },
  scoreLabel: { fontSize: 10, fontWeight: "900", color: colors.muted },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  sectionAccent: {
    borderLeftWidth: 4,
    borderColor: colors.gold,
    paddingLeft: 14,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.gold,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 6,
  },
  evidenceBlock: { paddingVertical: 20 },
  blockKicker: { fontSize: 11, fontWeight: "900", color: colors.green },
  sourceNotice: {
    fontSize: 10,
    color: colors.green,
    marginTop: 4,
    marginBottom: 10,
  },
  evidence: {
    backgroundColor: colors.paper,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  evidenceLabel: { fontSize: 12, fontWeight: "800", color: colors.ink },
  evidenceValue: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.green,
    marginTop: 2,
  },
  pricePanel: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  priceHead: { flexDirection: "row", alignItems: "flex-end" },
  priceKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: colors.gold,
  },
  priceStatus: {
    marginTop: 5,
    fontSize: 19,
    fontWeight: "900",
    color: colors.ink,
  },
  priceHelp: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
  },
  priceValue: {
    marginTop: 3,
    fontSize: 31,
    fontWeight: "900",
    color: colors.ink,
  },
  priceChartTitle: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink,
  },
  priceChangeBox: {
    marginLeft: "auto",
    alignItems: "flex-end",
    paddingBottom: 3,
  },
  priceChange: { fontSize: 14, fontWeight: "900", color: colors.green },
  priceDown: { color: colors.danger },
  marketState: { marginTop: 4, fontSize: 9, color: colors.muted },
  priceSource: { marginTop: 8, fontSize: 9, color: colors.muted },
  chartBlock: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  chartKicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.gold,
  },
  chartTitle: {
    marginTop: 5,
    fontSize: 18,
    fontWeight: "900",
    color: colors.ink,
  },
  chartHelp: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
  },
  evidenceExplanation: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: colors.ink,
  },
  evidenceWatch: { color: colors.danger },
  source: { marginTop: 11, flexDirection: "row", alignItems: "center", gap: 8 },
  sourceType: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.paper,
    backgroundColor: colors.soil,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  sourceText: { fontSize: 10, color: colors.muted, flex: 1 },
  danger: {
    padding: 18,
    backgroundColor: "#EBD9CC",
    borderLeftWidth: 4,
    borderColor: colors.danger,
    marginTop: 12,
  },
  dangerLabel: { fontSize: 10, fontWeight: "900", color: colors.danger },
  dangerText: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "700",
    color: colors.ink,
    marginTop: 5,
  },
  riskDig: {
    marginTop: 24,
    backgroundColor: colors.soilDark,
    padding: 18,
    borderRadius: 16,
  },
  riskHead: { flexDirection: "row", alignItems: "center" },
  riskKicker: { fontSize: 10, fontWeight: "900", color: colors.goldLight },
  riskTitle: { fontSize: 27, fontWeight: "900", color: colors.paper },
  riskButton: {
    minHeight: 52,
    backgroundColor: colors.goldLight,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  riskButtonText: { fontSize: 14, fontWeight: "900", color: colors.soilDark },
  riskLine: {
    color: colors.paper,
    fontSize: 15,
    fontWeight: "800",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.soil,
  },
  finding: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.soil,
  },
  findingMark: { color: colors.goldLight, fontWeight: "900" },
  findingText: { color: colors.paper, fontSize: 14, fontWeight: "700" },
  checking: { fontSize: 11, color: "#C7AB91", marginTop: 12 },
  final: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 2,
    borderColor: colors.gold,
  },
  finalLabel: { flex: 1, fontSize: 13, color: colors.paper, fontWeight: "800" },
  finalScore: { fontSize: 36, color: colors.goldLight, fontWeight: "900" },
});
