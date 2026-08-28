import { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { formatReturn, investors, performancePeriods, type PerformancePeriod } from "../src/data/investors";
import { formatStatementDate, recentCeos } from "../src/data/ceos";
import { colors, fonts, radius, spacing } from "../src/theme/tokens";
import { goBackOr } from "../src/navigation/goBackOr";

type Lens = "investors" | "ceos";

export default function Investors() {
  const [lens, setLens] = useState<Lens>("ceos");
  const [period, setPeriod] = useState<PerformancePeriod>("fiveYear");
  const ranked = useMemo(() => [...investors].sort((a, b) => b.performance[period] - a.performance[period]), [period]);

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable accessibilityLabel="뒤로 가기" hitSlop={12} onPress={() => goBackOr("/")}><Text style={s.back}>←</Text></Pressable>
        <Text style={s.title}>유명인 렌즈</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <View style={s.tabs}>
          <Tab label="CEO 발언" selected={lens === "ceos"} onPress={() => setLens("ceos")} />
          <Tab label="투자자" selected={lens === "investors"} onPress={() => setLens("investors")} />
        </View>
        {lens === "ceos" ? (
          <>
            <View style={s.sectionHead}><Text style={s.sectionTitle}>최근 발언</Text><Text style={s.updated}>2026.08.28 확인</Text></View>
            <View style={s.list}>
              {recentCeos.map((ceo) => (
                <Pressable key={ceo.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/ceo/[id]", params: { id: ceo.id } })} style={({ pressed }) => [s.ceoRow, pressed && s.pressed]}>
                  <View style={s.avatar}><Text style={s.avatarText}>{ceo.name.slice(0, 1)}</Text></View>
                  <View style={s.rowBody}>
                    <View style={s.nameLine}><Text style={s.name}>{ceo.name}</Text><Text style={s.company}>{ceo.company} · {ceo.ticker}</Text></View>
                    <Text style={s.headline}>{ceo.statement.headline}</Text>
                    <Text style={s.meta}>{formatStatementDate(ceo.statement.date)} · {ceo.statement.sourceType}</Text>
                  </View>
                  <Text style={s.arrow}>→</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.disclaimer}>공식 자료를 쉬운 말로 정리했어요. 투자 추천이 아니에요.</Text>
          </>
        ) : (
          <>
            <View style={s.sectionHead}><Text style={s.sectionTitle}>기간별 성과</Text></View>
            <View style={s.periods}>
              {performancePeriods.map((item) => (
                <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected: period === item.key }} onPress={() => setPeriod(item.key)} style={[s.period, period === item.key && s.periodSelected]}>
                  <Text style={[s.periodText, period === item.key && s.periodTextSelected]}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={s.list}>
              {ranked.map((investor, index) => (
                <Pressable key={investor.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/investor/[id]", params: { id: investor.id } })} style={({ pressed }) => [s.investorRow, pressed && s.pressed]}>
                  <Text style={s.rank}>{index + 1}</Text>
                  <View style={s.rowBody}><Text style={s.name}>{investor.name}</Text><Text style={s.investorStyle}>{investor.style}</Text></View>
                  <View style={s.returnBox}><Text style={[s.returnValue, investor.performance[period] < 0 && s.negative]}>{formatReturn(investor.performance[period])}</Text><Text style={s.returnLabel}>{investor.performanceLabels[period]}</Text></View>
                  <Text style={s.arrow}>→</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.disclaimer}>공개 성과는 비교 기준이 서로 달라요. 투자 추천이 아니에요.</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Tab({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityState={{ selected }} onPress={onPress} style={[s.tab, selected && s.tabSelected]}><Text style={[s.tabText, selected && s.tabTextSelected]}>{label}</Text></Pressable>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  header: { width: "100%", maxWidth: 768, minHeight: 64, paddingHorizontal: spacing.lg, alignSelf: "center", flexDirection: "row", alignItems: "center" },
  back: { fontSize: 27, color: colors.ink },
  title: { marginLeft: 14, fontSize: 20, fontFamily: fonts.bold, color: colors.ink },
  content: { width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: spacing.lg, paddingBottom: 48 },
  tabs: { flexDirection: "row", padding: 4, borderRadius: radius.md, backgroundColor: colors.cream },
  tab: { flex: 1, minHeight: 44, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  tabSelected: { backgroundColor: colors.paper },
  tabText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted },
  tabTextSelected: { color: colors.ink },
  sectionHead: { marginTop: 32, marginBottom: 12, flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.ink },
  updated: { marginLeft: "auto", fontSize: 10, fontFamily: fonts.regular, color: colors.muted },
  list: { borderTopWidth: 1, borderColor: colors.line },
  ceoRow: { minHeight: 112, borderBottomWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center" },
  avatar: { width: 46, height: 46, marginRight: 14, borderRadius: 17, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 17, fontFamily: fonts.bold, color: colors.soil },
  rowBody: { flex: 1, minWidth: 0 },
  nameLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontFamily: fonts.bold, color: colors.ink },
  company: { flexShrink: 1, fontSize: 10, fontFamily: fonts.medium, color: colors.muted },
  headline: { marginTop: 7, fontSize: 13, lineHeight: 19, fontFamily: fonts.semibold, color: colors.ink },
  meta: { marginTop: 6, fontSize: 9, fontFamily: fonts.regular, color: colors.muted },
  arrow: { width: 28, textAlign: "right", fontSize: 18, color: colors.muted },
  pressed: { opacity: 0.55 },
  periods: { flexDirection: "row", gap: 8, marginBottom: 18 },
  period: { flex: 1, minHeight: 40, borderRadius: radius.sm, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center" },
  periodSelected: { backgroundColor: colors.soil },
  periodText: { fontSize: 12, fontFamily: fonts.semibold, color: colors.muted },
  periodTextSelected: { color: colors.paper },
  investorRow: { minHeight: 88, borderBottomWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center" },
  rank: { width: 32, fontSize: 13, fontFamily: fonts.bold, color: colors.gold },
  investorStyle: { marginTop: 5, fontSize: 10, fontFamily: fonts.regular, color: colors.muted },
  returnBox: { alignItems: "flex-end", paddingLeft: 8 },
  returnValue: { fontSize: 17, fontFamily: fonts.bold, color: colors.green },
  negative: { color: colors.danger },
  returnLabel: { marginTop: 3, maxWidth: 78, fontSize: 8, fontFamily: fonts.regular, color: colors.muted, textAlign: "right" },
  disclaimer: { marginTop: 20, fontSize: 10, lineHeight: 16, fontFamily: fonts.regular, color: colors.muted, textAlign: "center" },
});
