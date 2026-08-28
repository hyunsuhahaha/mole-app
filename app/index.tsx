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
import { colors, fonts, spacing } from "../src/theme/tokens";

const lenses = [
  { mark: "↗", title: "빠르게 성장", copy: "매출이 실제로 크는 회사" },
  { mark: "$", title: "지금 흑자", copy: "본업으로 돈 버는 회사" },
  { mark: "↓", title: "많이 하락", copy: "가격과 사업을 따로 확인" },
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
          <Text style={s.brand}>MOLE</Text>
          <Text style={s.brandSub}>주식 발굴 연습장</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [s.profile, pressed && s.pressed]}
        >
          <Text style={s.profileTitle}>
            {riskProfile?.title ?? "성향 알아보기"}
          </Text>
          <Text style={s.profileArrow}>→</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[s.content, !compact && s.contentWide]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.folio}>
          <Text style={s.folioText}>FIELD NOTE · 001</Text>
          <Text style={s.folioText}>NYSE / NASDAQ</Text>
        </View>
        <Text style={s.greeting}>시장 전체에서{`\n`}근거 있는 회사 찾기</Text>
        <Pressable
          accessibilityRole="search"
          onPress={() => router.push("/search")}
          style={({ pressed }) => [s.search, pressed && s.pressed]}
        >
          <Text style={s.searchIcon}>⌕</Text>
          <Text style={s.searchText}>회사명이나 종목코드 검색</Text>
          <Text style={s.searchHint}>4,474개 공시</Text>
        </Pressable>
        <View style={s.digPanel}>
          <View style={s.strata}>
            <View style={[s.strataLine, s.strataOne]} />
            <View style={[s.strataLine, s.strataTwo]} />
            <View style={[s.strataLine, s.strataThree]} />
          </View>
          <View style={s.digCopy}>
            <Text style={s.panelKicker}>SCREENING ROUTE / 01</Text>
            <Text style={s.panelTitle}>
              조건을 정하고{`\n`}시장 한 층씩 파기
            </Text>
            <Text style={s.panelCopy}>
              답변을 실제 회사 숫자로 바꿔 탈락 과정과 남은 근거를 보여줘요.
            </Text>
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
                {riskProfile ? "회사 발굴 시작" : "내 성향부터 확인"}
              </Text>
              <Text style={s.panelButtonArrow}>→</Text>
            </Pressable>
          </View>
          <View style={s.moleWrap}>
            <Mole mood="idle" size={154} />
          </View>
        </View>
        <View style={s.sectionHead}>
          <Text style={s.sectionTitle}>탐사 기준 / 03</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() =>
              router.push(riskProfile ? "/conversation" : "/profile")
            }
          >
            <Text style={s.more}>전체 보기 →</Text>
          </Pressable>
        </View>
        <View style={[s.lenses, compact && s.lensesCompact]}>
          {lenses.map((lens) => (
            <Pressable
              key={lens.title}
              accessibilityRole="button"
              onPress={() =>
                router.push(riskProfile ? "/conversation" : "/profile")
              }
              style={({ pressed }) => [
                s.lens,
                compact && s.lensCompact,
                pressed && s.pressed,
              ]}
            >
              <View style={[s.lensMarker, s.lensMarkerCompact]}>
                <Text style={s.lensMark}>{lens.mark}</Text>
              </View>
              <View style={s.lensBodyCompact}>
                <Text style={[s.lensTitle, s.lensTitleCompact]}>
                  {lens.title}
                </Text>
                <Text style={[s.lensCopy, s.lensCopyCompact]}>{lens.copy}</Text>
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
            <Text style={s.sectionTitle}>오늘의 관찰 목록</Text>
            <Text style={s.sectionSub}>
              흑자이면서 최근 매출이 늘어난 회사예요
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/search")}
          >
            <Text style={s.more}>더 보기 →</Text>
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
            <Text style={s.errorText}>
              데이터 서버를 확인하고 다시 누르세요 →
            </Text>
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
            <Text style={s.linkKicker}>투자자 렌즈</Text>
            <Text style={s.linkTitle}>유명 투자자의 관점으로 보기</Text>
            <Text style={s.linkArrow}>→</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/methodology")}
            style={s.linkRow}
          >
            <Text style={s.linkKicker}>투명한 기준</Text>
            <Text style={s.linkTitle}>데이터와 계산 방법 확인</Text>
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
  page: { flex: 1, backgroundColor: colors.cream },
  topbar: {
    minHeight: 64,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
  },
  brandMark: {
    width: 28,
    height: 28,
    marginRight: 9,
    borderRadius: 1,
    backgroundColor: colors.ink,
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
    letterSpacing: 2.1,
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
    borderLeftWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  profileTitle: { fontSize: 9, fontFamily: fonts.bold, color: colors.green },
  profileArrow: { fontSize: 13, color: colors.green },
  content: { padding: spacing.lg, paddingTop: 21, paddingBottom: 40 },
  contentWide: { paddingHorizontal: spacing.xl, paddingTop: 28 },
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
  search: {
    minHeight: 59,
    marginTop: 18,
    paddingHorizontal: 16,
    borderRadius: 1,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.paper,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: { marginRight: 10, fontSize: 26, color: colors.green },
  searchText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  searchHint: { fontSize: 8, fontFamily: fonts.bold, color: colors.gold },
  pressed: { opacity: 0.6, transform: [{ translateY: 1 }] },
  digPanel: {
    minHeight: 220,
    marginTop: 18,
    padding: 20,
    borderRadius: 1,
    borderLeftWidth: 5,
    borderColor: colors.gold,
    backgroundColor: colors.soilDark,
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
    marginTop: 8,
    fontSize: 25,
    lineHeight: 30,
    fontFamily: fonts.bold,
    color: colors.paper,
  },
  panelCopy: {
    marginTop: 8,
    maxWidth: 190,
    fontSize: 10,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: "#D4C1AE",
  },
  panelButton: {
    minHeight: 44,
    marginTop: 15,
    paddingHorizontal: 13,
    borderRadius: 1,
    backgroundColor: colors.goldLight,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  panelButtonPressed: { transform: [{ translateY: 1 }], opacity: 0.8 },
  panelButtonText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.soilDark,
  },
  panelButtonArrow: { marginLeft: 16, fontSize: 17, color: colors.soilDark },
  moleWrap: {
    width: 154,
    alignSelf: "flex-end",
    marginRight: -4,
    marginBottom: -7,
  },
  sectionHead: {
    marginTop: 29,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: fonts.bold, color: colors.ink },
  sectionSub: {
    marginTop: 3,
    fontSize: 9,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  more: {
    paddingVertical: 3,
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.green,
  },
  lenses: {
    flexDirection: "column",
    gap: 0,
    borderTopWidth: 2,
    borderColor: colors.ink,
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
    paddingHorizontal: 2,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.line,
    backgroundColor: "transparent",
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
    borderRadius: 1,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  lensMark: { fontSize: 17, fontFamily: fonts.bold, color: colors.green },
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
  lensTitleCompact: { marginTop: 0, fontSize: 13 },
  lensCopyCompact: { marginTop: 3, fontSize: 10, lineHeight: 14 },
  lensArrow: { fontSize: 18, color: colors.gold },
  saved: {
    minHeight: 64,
    marginTop: 19,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderColor: colors.gold,
    backgroundColor: colors.paper,
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
    minHeight: 70,
    borderTopWidth: 1,
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
    backgroundColor: "#E7DCC8",
  },
  errorBox: { padding: 16, borderRadius: 13, backgroundColor: "#EBD9CC" },
  errorTitle: { fontSize: 12, fontWeight: "900", color: colors.danger },
  errorText: { marginTop: 4, fontSize: 10, color: colors.muted },
  links: { marginTop: 27, borderTopWidth: 2, borderColor: colors.ink },
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
