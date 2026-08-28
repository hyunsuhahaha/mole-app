import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Mole } from "../src/components/Mole";
import { researchApi, type StockSearchItem } from "../src/api/research";
import { useDigStore } from "../src/store/useDigStore";
import { colors, fonts, radius, spacing } from "../src/theme/tokens";

const lenses = [
  { mark: "↗", title: "성장 중인 회사" },
  { mark: "$", title: "꾸준히 돈 버는 회사" },
  { mark: "↓", title: "많이 떨어진 회사" },
];

export default function Home() {
  const { width } = useWindowDimensions();
  const compact = width < 560;
  const riskProfile = useDigStore((state) => state.riskProfile);
  const watchlist = useDigStore((state) => state.watchlist);
  const featured = useQuery({
    queryKey: ["home-featured"],
    queryFn: () => researchApi.searchStocks("", 5, "US", true),
    staleTime: 5 * 60_000,
    retry: 1,
  });
  return (
    <SafeAreaView style={s.page}>
      <View style={s.topbar}>
        <View style={s.brandMark}>
          <View style={s.brandDot} />
        </View>
        <View>
          <Text style={s.brand}>두더지</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [s.profile, pressed && s.pressed]}
        >
          <Text style={s.profileTitle}>
            {riskProfile?.title ?? "투자 성향"}
          </Text>
          <Text style={s.profileArrow}>→</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[s.content, !compact && s.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.greeting}>어떤 주식을{`\n`}찾고 있나요?</Text>
        <Text style={s.greetingSub}>조건부터 천천히 골라봐요</Text>
        <Pressable
          accessibilityRole="search"
          onPress={() => router.push("/search")}
          style={({ pressed }) => [s.search, pressed && s.pressed]}
        >
          <Text style={s.searchIcon}>⌕</Text>
          <Text style={s.searchText}>회사명·종목코드 검색</Text>
        </Pressable>
        <View style={s.digPanel}>
          <View style={s.digCopy}>
            <Text style={s.panelTitle}>조건으로 찾아보기</Text>
            <Text style={s.panelCopy}>원하는 조건만 고르면 돼요</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                router.push(riskProfile ? "/conversation" : "/profile")
              }
              style={({ pressed }) => [
                s.panelButton,
                pressed && s.panelButtonPressed,
              ]}
            >
              <Text style={s.panelButtonText}>
                {riskProfile ? "시작하기" : "성향부터 확인"}
              </Text>
              <Text style={s.panelButtonArrow}>→</Text>
            </Pressable>
          </View>
          <View style={s.moleWrap}>
            <Mole mood="idle" size={136} />
          </View>
        </View>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>빠르게 찾기</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(riskProfile ? "/conversation" : "/profile")
            }
          >
            <Text style={s.more}>직접 고르기</Text>
          </Pressable>
        </View>
        <View style={s.lenses}>
          {lenses.map((lens) => (
            <Pressable
              key={lens.title}
              accessibilityRole="button"
              onPress={() =>
                router.push(riskProfile ? "/conversation" : "/profile")
              }
              style={({ pressed }) => [s.lens, pressed && s.pressed]}
            >
              <View style={[s.lensMarker, s.lensMarkerCompact]}>
                <Text style={s.lensMark}>{lens.mark}</Text>
              </View>
              <View style={s.lensBodyCompact}>
                <Text style={[s.lensTitle, s.lensTitleCompact]}>
                  {lens.title}
                </Text>
              </View>
              <Text style={s.lensArrow}>→</Text>
            </Pressable>
          ))}
        </View>
        {!!watchlist.length && (
          <View style={s.saved}>
            <View>
              <Text style={s.savedLabel}>관심 회사</Text>
              <Text style={s.savedTickers}>{watchlist.join("  ·  ")}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/search")}
            >
              <Text style={s.savedArrow}>→</Text>
            </Pressable>
          </View>
        )}
        <View style={s.sectionHead}>
          <View>
            <Text style={s.sectionTitle}>오늘 눈에 띈 종목</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/search")}
          >
            <Text style={s.more}>전체 보기</Text>
          </Pressable>
        </View>
        {featured.isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <View key={index} style={s.skeleton} />
          ))}
        {featured.isError && (
          <Pressable
            accessibilityRole="button"
            onPress={() => featured.refetch()}
            style={s.errorBox}
          >
            <Text style={s.errorTitle}>회사 목록을 불러오지 못했어요</Text>
            <Text style={s.errorText}>다시 시도하기</Text>
          </Pressable>
        )}
        {featured.data?.items.map((stock) => (
          <FeaturedRow key={stock.ticker} stock={stock} />
        ))}
        <View style={s.links}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/investors")}
            style={s.linkRow}
          >
            <Text style={s.linkTitle}>투자자별로 보기</Text>
            <Text style={s.linkArrow}>→</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/methodology")}
            style={s.linkRow}
          >
            <Text style={s.linkTitle}>데이터 기준 보기</Text>
            <Text style={s.linkArrow}>→</Text>
          </Pressable>
        </View>
        <Text style={s.disclaimer}>
          학습과 종목 탐색을 위한 도구이며 투자 권유가 아닙니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedRow({ stock }: { stock: StockSearchItem }) {
  return (
    <Pressable
      accessibilityLabel={`${stock.ticker} 상세 보기`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/stock/[ticker]",
          params: { ticker: stock.ticker },
        })
      }
      style={({ pressed }) => [s.stockRow, pressed && s.pressed]}
    >
      <View style={s.stockIdentity}>
        <Text style={s.stockTicker}>{stock.ticker}</Text>
        <Text numberOfLines={1} style={s.stockCompany}>
          {stock.company}
        </Text>
      </View>
      <View style={s.stockMetric}>
        <Text style={s.stockGrowth}>
          {stock.revenue_growth == null
            ? "—"
            : `+${stock.revenue_growth.toFixed(1)}%`}
        </Text>
        <Text style={s.stockMetricLabel}>1년 매출 변화</Text>
      </View>
      <Text style={s.stockArrow}>→</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  topbar: {
    minHeight: 64,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  brandMark: {
    width: 28,
    height: 28,
    marginRight: 9,
    borderRadius: 10,
    backgroundColor: colors.soil,
    alignItems: "center",
    justifyContent: "center",
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.goldLight,
  },
  brand: {
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
    color: colors.ink,
  },
  brandSub: {
    marginTop: 1,
    fontSize: 8,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  profile: {
    minHeight: 32,
    marginLeft: "auto",
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  profileTitle: {
    fontSize: 11,
    fontFamily: fonts.semibold,
    color: colors.soil,
  },
  profileArrow: { fontSize: 13, color: colors.soil },
  content: { padding: spacing.lg, paddingTop: 32, paddingBottom: 48 },
  contentWide: { paddingHorizontal: spacing.xl, paddingTop: 40 },
  folio: {
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  folioText: {
    fontSize: 8,
    letterSpacing: 1.4,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  greeting: {
    fontSize: 34,
    lineHeight: 41,
    letterSpacing: -1.2,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  greetingSub: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  search: {
    minHeight: 59,
    marginTop: 28,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: { marginRight: 10, fontSize: 24, color: colors.soil },
  searchText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  searchHint: { fontSize: 8, fontFamily: fonts.bold, color: colors.gold },
  pressed: { opacity: 0.6, transform: [{ translateY: 1 }] },
  digPanel: {
    minHeight: 188,
    marginTop: 16,
    padding: 22,
    borderRadius: radius.lg,
    backgroundColor: "#F2F4F6",
    flexDirection: "row",
    overflow: "hidden",
  },
  strata: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    pointerEvents: "none",
    opacity: 0.22,
  },
  strataLine: {
    position: "absolute",
    right: -24,
    height: 1,
    backgroundColor: colors.goldLight,
    transform: [{ rotate: "-4deg" }],
  },
  strataOne: { top: 49, width: "55%" },
  strataTwo: { top: 103, width: "41%" },
  strataThree: { top: 166, width: "62%" },
  digCopy: { flex: 1, zIndex: 1 },
  panelKicker: {
    fontSize: 9,
    fontFamily: fonts.bold,
    letterSpacing: 1.1,
    color: colors.goldLight,
  },
  panelTitle: {
    fontSize: 22,
    lineHeight: 29,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  panelCopy: {
    marginTop: 8,
    maxWidth: 190,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  panelButton: {
    minHeight: 44,
    marginTop: 15,
    paddingHorizontal: 13,
    borderRadius: radius.sm,
    backgroundColor: colors.soil,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  panelButtonPressed: { transform: [{ translateY: 1 }], opacity: 0.8 },
  panelButtonText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.paper,
  },
  panelButtonArrow: { marginLeft: 16, fontSize: 17, color: colors.paper },
  moleWrap: {
    width: 136,
    alignSelf: "flex-end",
    marginRight: -4,
    marginBottom: -7,
  },
  sectionHead: {
    marginTop: 36,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: { fontSize: 20, fontFamily: fonts.bold, color: colors.ink },
  sectionSub: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  more: {
    paddingVertical: 3,
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.soil,
  },
  lenses: {
    flexDirection: "column",
    gap: 0,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    overflow: "hidden",
  },
  lensesCompact: {
    flexDirection: "column",
    gap: 0,
    borderTopWidth: 2,
    borderColor: colors.ink,
  },
  lens: {
    flex: 0,
    minHeight: 72,
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
  },
  lensCompact: {
    flex: 0,
    minHeight: 72,
    paddingHorizontal: 2,
    paddingVertical: 12,
    borderRadius: 0,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
  },
  lensMarker: { minHeight: 22 },
  lensMarkerCompact: {
    width: 34,
    height: 34,
    minHeight: 34,
    marginRight: 13,
    borderRadius: 12,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  lensMark: { fontSize: 17, fontFamily: fonts.bold, color: colors.soil },
  lensTitle: {
    marginTop: 11,
    fontSize: 12,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  lensCopy: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 13,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  lensBodyCompact: { flex: 1 },
  lensTitleCompact: { marginTop: 0, fontSize: 15 },
  lensCopyCompact: { marginTop: 3, fontSize: 10, lineHeight: 14 },
  lensArrow: { fontSize: 18, color: colors.muted },
  saved: {
    minHeight: 64,
    marginTop: 19,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  savedLabel: { fontSize: 9, fontWeight: "900", color: colors.green },
  savedTickers: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "900",
    color: colors.ink,
  },
  savedArrow: { fontSize: 20, color: colors.green },
  stockRow: {
    minHeight: 76,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
  },
  stockIdentity: { flex: 1, minWidth: 0 },
  stockTicker: { fontSize: 15, fontWeight: "900", color: colors.ink },
  stockCompany: {
    marginTop: 2,
    maxWidth: 210,
    fontSize: 9,
    color: colors.muted,
  },
  stockMetric: { alignItems: "flex-end" },
  stockGrowth: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.green,
    fontVariant: ["tabular-nums"],
  },
  stockMetricLabel: { marginTop: 2, fontSize: 8, color: colors.muted },
  stockArrow: {
    width: 25,
    textAlign: "right",
    fontSize: 18,
    color: colors.gold,
  },
  skeleton: {
    height: 59,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: colors.cream,
  },
  errorBox: { padding: 16, borderRadius: 13, backgroundColor: "#EBD9CC" },
  errorTitle: { fontSize: 12, fontWeight: "900", color: colors.danger },
  errorText: { marginTop: 4, fontSize: 10, color: colors.muted },
  links: {
    marginTop: 32,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
    overflow: "hidden",
  },
  linkRow: {
    minHeight: 72,
    borderBottomWidth: 1,
    borderColor: colors.line,
    justifyContent: "center",
  },
  linkKicker: {
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    color: colors.green,
  },
  linkTitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "900",
    color: colors.ink,
  },
  linkArrow: {
    position: "absolute",
    right: 0,
    fontSize: 20,
    color: colors.gold,
  },
  disclaimer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 9,
    color: colors.muted,
  },
});
