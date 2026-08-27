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
import { Mole } from "../../src/components/Mole";
import { mockResults } from "../../src/data/mock";
import { useDigStore } from "../../src/store/useDigStore";
import { colors, spacing } from "../../src/theme/tokens";
export default function StockDetail() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  const live = useDigStore((x) => x.results);
  const stock =
    live.find((x) => x.ticker === ticker) ??
    mockResults.find((x) => x.ticker === ticker) ??
    mockResults[0];
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
  const finalScore = riskStep < 4 ? stock.preRiskScore : stock.score;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>쉬운 종목 설명</Text>
        <Text style={s.step}>04 / 04</Text>
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
              {riskStep === 4 ? "위험 확인 후 점수" : "처음 발견 점수"}
            </Text>
          </View>
        </View>
        <Section label="왜 남았나요?" text={stock.whyFound} />
        <Section label="가장 좋은 점" text={stock.strongestCase} accent />
        <View style={s.evidenceBlock}>
          <Text style={s.blockKicker}>실제 숫자와 출처</Text>
          <Text style={s.sourceNotice}>
            {stock.dataSource === "SEC EDGAR"
              ? "회사가 SEC에 낸 실제 자료"
              : "연습용 예시 자료"}
          </Text>
          {stock.evidence.map((e) => (
            <Pressable
              key={e.label}
              disabled={!e.url}
              onPress={() => e.url && Linking.openURL(e.url)}
              style={s.evidence}
            >
              <Text style={s.evidenceLabel}>{e.label} ✓</Text>
              <Text style={s.evidenceValue}>{e.value}</Text>
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
              size={88}
            />
          </View>
          {riskStep === 0 ? (
            <Pressable style={s.riskButton} onPress={() => setRunning(true)}>
              <Text style={s.riskButtonText}>
                좋은 점이 맞는지 다시 확인하기 →
              </Text>
            </Pressable>
          ) : (
            <View>
              {riskStep >= 1 && (
                <Animated.Text entering={FadeInDown} style={s.riskLine}>
                  발견 점수 {stock.preRiskScore}
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
                  <Text style={s.finalLabel}>위험 확인 후 점수</Text>
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
  step: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  content: { padding: spacing.lg, paddingBottom: 48 },
  identity: {
    flexDirection: "row",
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderColor: colors.ink,
  },
  ticker: { fontSize: 42, fontWeight: "900", color: colors.ink },
  company: { fontSize: 13, color: colors.muted },
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
