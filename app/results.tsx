import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Mole } from "../src/components/Mole";
import { useDigStore } from "../src/store/useDigStore";
import { colors, spacing } from "../src/theme/tokens";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { goBackOr } from "../src/navigation/goBackOr";
export default function Results() {
  const stored = useDigStore((x) => x.results);
  const profile = useDigStore((x) => x.screeningProfile);
  const results = stored;
  const exactCount = results.filter((item) => item.matchStatus !== "closest").length;
  const showingClosest = !!results.length && exactCount === 0;
  const coverageNote = results[0]?.coverageNote;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => goBackOr("/digging")}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <View>
          <Text style={s.kicker}>두더지가 찾은 후보</Text>
          <Text style={s.title}>{showingClosest ? `가장 가까운 후보 ${results.length}개` : `상위 후보 ${exactCount}개`}</Text>
        </View>
        <Text style={s.step}>03 / 04</Text>
      </View>
      <View style={s.found}>
        <Mole mood="found" size={108} />
        <Text style={s.foundCopy}>
          {showingClosest ? `${coverageNote ? "확인한 범위에서는 정확히 맞지 않았어요." : "정확히 맞는 종목은 없었어요."}\n부족한 조건을 숨기지 않고 보여드려요.` : `순위보다 이유를 먼저 보세요.\n점수는 위험까지 확인한 결과예요.`}
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.list}
      >
        {!results.length && (
          <View style={s.noResults}>
            <Text style={s.resultNoticeTitle}>표시할 실제 후보가 없어요</Text>
            <Text style={s.resultNoticeText}>샘플 종목으로 채우지 않았어요. 조건을 넓혀 다시 검색해주세요.</Text>
            <PrimaryButton label="조건 다시 고르기" onPress={() => router.replace("/conversation")} />
          </View>
        )}
        {profile && (
          <View style={s.brief}>
            <Text style={s.briefLabel}>내가 부탁한 말</Text>
            <Text style={s.briefQuery}>“{profile.query}”</Text>
            <Text style={s.briefMeta}>
              실제 반영 {profile.must.length}개 · 추가 확인 {profile.pending.length}개
              {profile.unknownCount ? ` · 모름 ${profile.unknownCount}개` : ""}
            </Text>
          </View>
        )}
        {!!coverageNote && <View style={s.coverageBox}><Text style={s.coverageTitle}>이번 검색 범위</Text><Text style={s.coverageText}>{coverageNote}</Text></View>}
        {results.map((stock, i) => (
          <Pressable
            accessibilityLabel={`${stock.ticker} 상세 보기`}
            accessibilityRole="button"
            key={stock.ticker}
            onPress={() =>
              router.push({
                pathname: "/stock/[ticker]",
                params: { ticker: stock.ticker },
              })
            }
            style={({ pressed }) => [s.row, pressed && s.pressed]}
          >
            <Text style={s.rank}>{stock.matchStatus === "closest" ? "근접" : "후보"}{`\n`}{String(i + 1).padStart(2, "0")}</Text>
            <View style={s.body}>
              <View style={s.stockHead}>
                <View>
                  <Text style={s.ticker}>{stock.ticker}</Text>
                  <Text style={s.company}>{stock.company}</Text>
                </View>
                <View style={s.score}>
                  <Text style={s.scoreValue}>{stock.score}</Text>
                  <Text style={s.scoreLabel}>자료 일치도</Text>
                </View>
              </View>
              <Text style={s.reason}>{stock.reason}</Text>
              {!!stock.missedConditions?.length && (
                <View style={s.missedBox}>
                  <Text style={s.missedTitle}>통과하지 못한 조건</Text>
                  {stock.missedConditions.map((condition) => <Text key={condition} style={s.missedText}>• {condition}</Text>)}
                </View>
              )}
              {stock.business && <Text style={s.business}>{stock.business}</Text>}
              <View style={s.numberStrip}>
                {stock.evidence.slice(0, 3).map((item) => (
                  <View key={item.label} style={s.numberItem}>
                    <Text style={s.numberValue}>{item.value}</Text>
                    <Text style={s.numberLabel} numberOfLines={2}>{item.label}</Text>
                  </View>
                ))}
              </View>
              <View style={s.risk}>
                <Text style={s.riskMark}>!</Text>
                <Text style={s.riskText}>{stock.risk}</Text>
                <Text style={s.open}>쉽게 보기 →</Text>
              </View>
            </View>
          </Pressable>
        ))}
        <View style={s.resultNotice}>
          <Text style={s.resultNoticeTitle}>후보는 추천주가 아니에요</Text>
          <Text style={s.resultNoticeText}>
            마지막으로 정상 동기화된 SEC 공시 스냅샷만 비교합니다. 투자 전 최신
            공시 원문, 가격, 경쟁사와 본인의 손실 감수 범위를 따로 확인하세요.
          </Text>
          <PrimaryButton
            label="데이터와 판단 기준 보기"
            onPress={() => router.push("/methodology")}
          />
        </View>
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
  back: { fontSize: 26, color: colors.ink },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    color: colors.green,
  },
  title: { fontSize: 28, fontWeight: "900", color: colors.ink },
  step: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  found: {
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    paddingVertical: 8,
  },
  foundCopy: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: colors.muted,
  },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 24 },
  brief: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#E8DDC6",
  },
  briefLabel: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    color: colors.green,
  },
  briefQuery: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "800",
    color: colors.ink,
  },
  briefMeta: { marginTop: 6, fontSize: 10, color: colors.muted },
  coverageBox: { marginBottom: 12, padding: 12, borderLeftWidth: 3, borderColor: colors.gold, backgroundColor: colors.paper },
  coverageTitle: { fontSize: 9, fontWeight: "900", color: colors.gold },
  coverageText: { marginTop: 4, fontSize: 10, lineHeight: 15, color: colors.muted },
  row: {
    flexDirection: "row",
    paddingVertical: 18,
    borderTopWidth: 1,
    borderColor: colors.line,
  },
  pressed: { opacity: 0.6 },
  rank: { width: 38, fontSize: 9, lineHeight: 13, fontWeight: "900", color: colors.gold },
  body: { flex: 1 },
  stockHead: { flexDirection: "row" },
  ticker: { fontSize: 25, fontWeight: "900", color: colors.ink },
  company: { fontSize: 12, color: colors.muted },
  score: { marginLeft: "auto", alignItems: "flex-end" },
  scoreValue: { fontSize: 26, fontWeight: "900", color: colors.green },
  scoreLabel: { fontSize: 9, fontWeight: "900", color: colors.muted },
  reason: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    fontWeight: "700",
    marginTop: 12,
  },
  risk: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 9 },
  riskMark: {
    width: 20,
    height: 20,
    textAlign: "center",
    lineHeight: 20,
    borderRadius: 10,
    backgroundColor: colors.danger,
    color: colors.paper,
    fontWeight: "900",
  },
  riskText: { fontSize: 11, color: colors.danger, fontWeight: "700" },
  open: {
    marginLeft: "auto",
    fontSize: 11,
    color: colors.green,
    fontWeight: "900",
  },
  missedBox: { marginTop: 10, padding: 11, borderRadius: 10, backgroundColor: "#EBD9CC" },
  missedTitle: { fontSize: 9, fontWeight: "900", color: colors.danger },
  missedText: { marginTop: 4, fontSize: 10, lineHeight: 15, color: colors.ink },
  business: { marginTop: 7, fontSize: 12, lineHeight: 18, color: colors.muted },
  numberStrip: { flexDirection: "row", gap: 7, marginTop: 12 },
  numberItem: { flex: 1, minHeight: 60, padding: 9, backgroundColor: colors.paper, borderTopWidth: 2, borderColor: colors.gold },
  numberValue: { fontSize: 15, fontWeight: "900", color: colors.green },
  numberLabel: { marginTop: 3, fontSize: 8, lineHeight: 11, color: colors.muted },
  resultNotice: { marginTop: 8, paddingTop: 18, borderTopWidth: 1, borderColor: colors.line },
  noResults: { paddingVertical: 28 },
  resultNoticeTitle: { color: colors.danger, fontSize: 13, fontWeight: "900" },
  resultNoticeText: { marginTop: 6, marginBottom: 12, color: colors.muted, fontSize: 10, lineHeight: 16 },
});
