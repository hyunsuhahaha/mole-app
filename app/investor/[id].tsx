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
import { PrimaryButton } from "../../src/components/PrimaryButton";
import {
  formatReturn,
  investors,
  performancePeriods,
} from "../../src/data/investors";
import { useDigStore } from "../../src/store/useDigStore";
import { colors, spacing } from "../../src/theme/tokens";
import { goBackOr } from "../../src/navigation/goBackOr";

export default function InvestorDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const investor = investors.find((item) => item.id === id) ?? investors[0];
  const setFilter = useDigStore((state) => state.setFilter);

  const useLens = () => {
    Object.entries(investor.filterPreset).forEach(([key, value]) => {
      if (value) setFilter(key as keyof typeof investor.filterPreset, value);
    });
    router.push("/setup");
  };

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          hitSlop={12}
          onPress={() => goBackOr("/investors")}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>투자자 렌즈</Text>
        <Text style={s.asOf}>자료 {investor.performanceAsOf}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <View style={s.identity}>
          <Text style={s.name}>{investor.name}</Text>
          <Text style={s.nameEn}>{investor.nameEn}</Text>
          <Text style={s.vehicle}>{investor.vehicle}</Text>
        </View>

        <Text style={s.style}>{investor.style}</Text>
        <Text style={s.summary}>{investor.summary}</Text>

        <View style={s.performance}>
          {performancePeriods.map((period) => {
            const value = investor.performance[period.key];
            return (
              <View key={period.key} style={s.metric}>
                <Text style={[s.metricValue, value < 0 && s.metricNegative]}>
                  {formatReturn(value)}
                </Text>
                <Text style={s.metricLabel}>
                  {investor.performanceLabels[period.key]}
                </Text>
              </View>
            );
          })}
        </View>
        <Text style={s.performanceNote}>{investor.performanceNote}</Text>
        <Pressable
          accessibilityRole="link"
          onPress={() => Linking.openURL(investor.performanceSource)}
          style={({ pressed }) => [s.sourceLink, pressed && s.pressed]}
        >
          <Text style={s.sourceLinkText}>공식 성과 자료 열기 →</Text>
        </Pressable>

        <View style={s.section}>
          <Text style={s.sectionTitle}>이 렌즈가 먼저 보는 것</Text>
          <View style={s.lensGrid}>
            {investor.lens.map((item, index) => (
              <View key={item} style={s.lensItem}>
                <Text style={s.lensNumber}>{String(index + 1).padStart(2, "0")}</Text>
                <Text style={s.lensText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>공개 자료에서 보이는 분야</Text>
          <View style={s.tags}>
            {investor.sectors.map((sector) => (
              <Text key={sector} style={s.tag}>
                {sector}
              </Text>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>직접 밝힌 최근 투자 관점</Text>
          <Text style={s.ideasIntro}>
            X, 주주서한, 인터뷰와 발표 원문을 쉬운 말로 정리했어요.
          </Text>
          <View style={s.ideas}>
            {investor.ideas.map((idea) => (
              <Pressable
                key={`${idea.date}-${idea.title}`}
                accessibilityRole="link"
                onPress={() => Linking.openURL(idea.source)}
                style={({ pressed }) => [s.idea, pressed && s.pressed]}
              >
                <View style={s.ideaMeta}>
                  <Text style={s.ideaType}>{idea.sourceType}</Text>
                  <Text style={s.ideaDate}>{idea.date}</Text>
                </View>
                <Text style={s.ideaTitle}>{idea.title}</Text>
                <Text style={s.ideaSummary}>{idea.summary}</Text>
                <View style={s.ideaBottom}>
                  <Text style={s.ideaRelated}>{idea.related.join("  ")}</Text>
                  <Text style={s.ideaOpen}>원문 →</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>공개 보유 종목</Text>
            <Text style={s.holdingsDate}>{investor.holdingsAsOf}</Text>
          </View>
          <Text style={s.holdingsNote}>{investor.holdingsNote}</Text>
          <View style={s.holdings}>
            {investor.holdings.map((holding) => (
              <View key={`${holding.ticker}-${holding.company}`} style={s.holding}>
                <Text style={s.ticker}>{holding.ticker}</Text>
                <Text style={s.company}>{holding.company}</Text>
                {holding.weight && <Text style={s.weight}>{holding.weight}</Text>}
              </View>
            ))}
          </View>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(investor.holdingsSource)}
            style={({ pressed }) => [s.sourceLink, pressed && s.pressed]}
          >
            <Text style={s.sourceLinkText}>공식 보유 자료 열기 →</Text>
          </Pressable>
        </View>

        <View style={s.warning}>
          <Text style={s.warningTitle}>보유 종목은 추천 종목이 아니에요.</Text>
          <Text style={s.warningText}>
            공개 시점 이후 매매했을 수 있고, 실제 포트폴리오 전체와 다를 수 있어요.
          </Text>
        </View>

        <PrimaryButton
          label={`${investor.name} 렌즈로 찾기`}
          onPress={useLens}
          style={s.cta}
        />
      </ScrollView>
    </SafeAreaView>
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
  back: { fontSize: 27, color: colors.ink },
  headerTitle: { fontSize: 14, fontWeight: "900", color: colors.ink, marginLeft: 14 },
  asOf: { marginLeft: "auto", fontSize: 9, color: colors.muted },
  content: { padding: spacing.lg, paddingBottom: 48 },
  identity: { borderBottomWidth: 3, borderColor: colors.ink, paddingBottom: 16 },
  name: { fontSize: 38, lineHeight: 42, fontWeight: "900", color: colors.ink, letterSpacing: -1.2 },
  nameEn: { fontSize: 12, color: colors.muted, marginTop: 2 },
  vehicle: { fontSize: 11, fontWeight: "800", color: colors.green, marginTop: 8 },
  style: { fontSize: 20, lineHeight: 27, fontWeight: "900", color: colors.ink, marginTop: 20 },
  summary: { fontSize: 14, lineHeight: 21, color: colors.muted, marginTop: 8 },
  performance: { flexDirection: "row", gap: 8, marginTop: 20 },
  metric: { flex: 1, backgroundColor: colors.paper, padding: 10, minHeight: 76, justifyContent: "space-between", borderRadius: 10 },
  metricValue: { fontSize: 19, fontWeight: "900", color: colors.green },
  metricNegative: { color: colors.danger },
  metricLabel: { fontSize: 8, lineHeight: 11, color: colors.muted },
  performanceNote: { fontSize: 9, lineHeight: 14, color: colors.muted, marginTop: 9 },
  sourceLink: { alignSelf: "flex-start", paddingVertical: 10 },
  sourceLinkText: { fontSize: 11, color: colors.green, fontWeight: "900" },
  pressed: { opacity: 0.55 },
  section: { paddingVertical: 20, borderTopWidth: 1, borderColor: colors.line },
  sectionHead: { flexDirection: "row", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: colors.ink },
  lensGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  lensItem: { width: "48%", minHeight: 72, padding: 12, backgroundColor: colors.paper, borderRadius: 10 },
  lensNumber: { fontSize: 9, color: colors.gold, fontWeight: "900" },
  lensText: { fontSize: 13, lineHeight: 18, color: colors.ink, fontWeight: "800", marginTop: 7 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  tag: { fontSize: 11, color: colors.green, fontWeight: "800", backgroundColor: "#E0E4D5", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  ideasIntro: { fontSize: 10, lineHeight: 15, color: colors.muted, marginTop: 6 },
  ideas: { marginTop: 12, gap: 10 },
  idea: { backgroundColor: colors.paper, padding: 14, borderRadius: 10 },
  ideaMeta: { flexDirection: "row", alignItems: "center" },
  ideaType: { fontSize: 9, fontWeight: "900", color: colors.green },
  ideaDate: { marginLeft: "auto", fontSize: 9, color: colors.muted },
  ideaTitle: { fontSize: 15, lineHeight: 20, fontWeight: "900", color: colors.ink, marginTop: 9 },
  ideaSummary: { fontSize: 11, lineHeight: 17, color: colors.muted, marginTop: 6 },
  ideaBottom: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  ideaRelated: { flex: 1, fontSize: 9, color: colors.green, fontWeight: "800" },
  ideaOpen: { fontSize: 10, color: colors.green, fontWeight: "900" },
  holdingsDate: { marginLeft: "auto", fontSize: 9, color: colors.muted },
  holdingsNote: { fontSize: 10, lineHeight: 15, color: colors.muted, marginTop: 6 },
  holdings: { marginTop: 12, borderTopWidth: 1, borderColor: colors.line },
  holding: { minHeight: 46, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: colors.line },
  ticker: { width: 58, fontSize: 15, fontWeight: "900", color: colors.green },
  company: { flex: 1, fontSize: 12, fontWeight: "700", color: colors.ink },
  weight: { fontSize: 11, fontWeight: "900", color: colors.muted },
  warning: { padding: 16, backgroundColor: "#EBD9CC", borderLeftWidth: 4, borderColor: colors.danger },
  warningTitle: { fontSize: 12, fontWeight: "900", color: colors.danger },
  warningText: { fontSize: 10, lineHeight: 15, color: colors.muted, marginTop: 5 },
  cta: { marginTop: 22 },
});
