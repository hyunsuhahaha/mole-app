import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import {
  formatReturn,
  investors,
  performancePeriods,
  type PerformancePeriod,
} from "../src/data/investors";
import { colors, spacing } from "../src/theme/tokens";
import { goBackOr } from "../src/navigation/goBackOr";

export default function Investors() {
  const [period, setPeriod] = useState<PerformancePeriod>("fiveYear");
  const ranked = useMemo(
    () =>
      [...investors].sort(
        (a, b) => b.performance[period] - a.performance[period],
      ),
    [period],
  );

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          onPress={() => goBackOr("/")}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <View style={s.headerCopy}>
          <Text style={s.kicker}>투자자의 공개 발자국</Text>
          <Text style={s.title}>누구의 방식으로 팔까요?</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <View style={s.intro}>
          <View style={s.introCopy}>
            <Text style={s.introTitle}>성과와 생각을 같이 봐요.</Text>
            <Text style={s.introText}>
              순위만 믿지 말고 어떤 기준으로 골랐는지 확인해보세요.
            </Text>
          </View>
        </View>

        <Text style={s.sortLabel}>어느 기간으로 줄 세울까요?</Text>
        <View style={s.periods}>
          {performancePeriods.map((item) => {
            const selected = period === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setPeriod(item.key)}
                style={[s.period, selected && s.periodSelected]}
              >
                <Text style={[s.periodText, selected && s.periodTextSelected]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={s.notice}>
          <Text style={s.noticeMark}>!</Text>
          <Text style={s.noticeText}>
            투자자마다 공식 투자수단이 달라 완전히 같은 조건의 비교는 아니에요.
          </Text>
        </View>

        <View style={s.list}>
          {ranked.map((investor, index) => (
            <Pressable
              key={investor.id}
              accessibilityRole="button"
              onPress={() =>
                router.push({
                  pathname: "/investor/[id]",
                  params: { id: investor.id },
                })
              }
              style={({ pressed }) => [s.row, pressed && s.rowPressed]}
            >
              <Text style={s.rank}>{String(index + 1).padStart(2, "0")}</Text>
              <View style={s.rowBody}>
                <View style={s.nameRow}>
                  <View style={s.nameCopy}>
                    <Text style={s.name}>{investor.name}</Text>
                    <Text style={s.vehicle}>{investor.vehicle}</Text>
                  </View>
                  <View style={s.returnBox}>
                    <Text
                      style={[
                        s.returnValue,
                        investor.performance[period] < 0 && s.returnNegative,
                      ]}
                    >
                      {formatReturn(investor.performance[period])}
                    </Text>
                    <Text style={s.returnLabel}>
                      {investor.performanceLabels[period]}
                    </Text>
                  </View>
                </View>
                <Text style={s.style}>{investor.style}</Text>
                <View style={s.ideaPreview}>
                  <Text style={s.ideaSource}>
                    {investor.ideas[0].sourceType}
                  </Text>
                  <Text style={s.ideaTitle} numberOfLines={2}>
                    {investor.ideas[0].title}
                  </Text>
                </View>
                <View style={s.sectors}>
                  {investor.sectors.slice(0, 3).map((sector) => (
                    <Text key={sector} style={s.sector}>
                      {sector}
                    </Text>
                  ))}
                  <Text style={s.open}>자세히 보기 →</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={s.disclaimer}>
          공개 자료를 쉽게 정리한 학습용 정보입니다. 투자 권유가 아닙니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: {
    marginHorizontal: spacing.lg,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderColor: colors.ink,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  back: { fontSize: 27, color: colors.ink },
  headerCopy: { flex: 1 },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: colors.green,
  },
  title: { fontSize: 24, fontWeight: "900", color: colors.ink, marginTop: 2 },
  content: { padding: spacing.lg, paddingBottom: 44 },
  intro: {
    minHeight: 94,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: colors.line,
    marginBottom: 18,
  },
  introCopy: { maxWidth: 275 },
  introTitle: { fontSize: 18, fontWeight: "900", color: colors.ink },
  introText: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginTop: 6,
    maxWidth: 220,
  },
  sortLabel: { fontSize: 12, fontWeight: "800", color: colors.ink },
  periods: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  period: {
    flex: 1,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  periodSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  periodText: { fontSize: 13, fontWeight: "800", color: colors.muted },
  periodTextSelected: { color: colors.paper },
  notice: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#E7DDC8",
    padding: 12,
    borderLeftWidth: 3,
    borderColor: colors.gold,
    marginBottom: 8,
  },
  noticeMark: { color: colors.gold, fontWeight: "900" },
  noticeText: { flex: 1, fontSize: 10, lineHeight: 15, color: colors.muted },
  list: { borderTopWidth: 1, borderColor: colors.line },
  row: {
    flexDirection: "row",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  rowPressed: { opacity: 0.62, transform: [{ translateY: 1 }] },
  rank: { width: 34, fontSize: 11, fontWeight: "900", color: colors.gold },
  rowBody: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "flex-start" },
  nameCopy: { flex: 1, paddingRight: 10 },
  name: { fontSize: 21, fontWeight: "900", color: colors.ink },
  vehicle: { fontSize: 10, color: colors.muted, marginTop: 2 },
  returnBox: { alignItems: "flex-end", maxWidth: 108 },
  returnValue: { fontSize: 22, fontWeight: "900", color: colors.green },
  returnNegative: { color: colors.danger },
  returnLabel: { fontSize: 8, color: colors.muted, textAlign: "right" },
  style: { fontSize: 13, fontWeight: "800", color: colors.ink, marginTop: 12 },
  ideaPreview: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 7,
    marginTop: 8,
  },
  ideaSource: {
    fontSize: 8,
    fontWeight: "900",
    color: colors.paper,
    backgroundColor: colors.soil,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 1,
  },
  ideaTitle: {
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
    color: colors.muted,
    fontWeight: "700",
  },
  sectors: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginTop: 9,
  },
  sector: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.green,
    backgroundColor: "#E0E4D5",
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 1,
  },
  open: {
    marginLeft: "auto",
    fontSize: 9,
    fontWeight: "900",
    color: colors.green,
  },
  disclaimer: {
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
    textAlign: "center",
    marginTop: 20,
  },
});
