import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { researchApi, type StockSearchItem } from "../src/api/research";
import { goBackOr } from "../src/navigation/goBackOr";
import { colors, spacing } from "../src/theme/tokens";

export default function SearchStocks() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [market, setMarket] = useState<"US" | "KR">("US");
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(timer);
  }, [query]);
  const stocks = useQuery({
    queryKey: ["stock-directory", market, debounced],
    queryFn: () => researchApi.searchStocks(debounced, 20, market),
    staleTime: 60_000,
    retry: 1,
  });

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable accessibilityLabel="뒤로 가기" accessibilityRole="button" hitSlop={12} onPress={() => goBackOr("/")}>
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>종목 찾기</Text>
        <Text style={s.count}>{stocks.data?.count ? `${stocks.data.count.toLocaleString()}개` : market === "US" ? "미국 주식" : "국내 주식"}</Text>
      </View>
      <View style={s.marketTabs}>
        {([['US', '해외 · 미국'], ['KR', '국내']] as const).map(([value, label]) => (
          <Pressable key={value} accessibilityRole="tab" accessibilityState={{ selected: market === value }} onPress={() => setMarket(value)} style={[s.marketTab, market === value && s.marketTabActive]}>
            <Text style={[s.marketTabText, market === value && s.marketTabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.searchBox}>
        <Text style={s.searchMark}>⌕</Text>
        <TextInput
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          accessibilityLabel="회사명 또는 종목코드 검색"
          onChangeText={setQuery}
          placeholder="회사명이나 종목코드 검색"
          placeholderTextColor={colors.muted}
          returnKeyType="search"
          style={s.input}
          value={query}
        />
        {!!query && <Pressable accessibilityLabel="검색어 지우기" accessibilityRole="button" onPress={() => setQuery("")}><Text style={s.clear}>×</Text></Pressable>}
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>{debounced ? `“${debounced}” 검색 결과` : market === "US" ? "미국 상장 종목" : "국내 상장 종목"}</Text>
        <Text style={s.sectionHelp}>{debounced ? "종목코드와 회사 이름을 함께 찾았어요." : `${market === "US" ? "미국" : "국내"} 종목을 코드 순서로 보여드려요. 검색하면 회사명과 종목코드로 바로 찾을 수 있어요.`}</Text>
        {stocks.isLoading && Array.from({ length: 6 }).map((_, index) => <View key={index} style={s.skeleton} />)}
        {stocks.isError && (
          <View style={s.stateBox}>
            <Text style={s.stateTitle}>종목 목록을 불러오지 못했어요</Text>
            <Text style={s.stateText}>PC의 데이터 서버가 켜져 있는지 확인해주세요.</Text>
            <Pressable accessibilityRole="button" onPress={() => stocks.refetch()}><Text style={s.retry}>다시 불러오기 →</Text></Pressable>
          </View>
        )}
        {!stocks.isLoading && !stocks.isError && !stocks.data?.items.length && (
          <View style={s.stateBox}><Text style={s.stateTitle}>일치하는 회사를 찾지 못했어요</Text><Text style={s.stateText}>영문 회사명이나 종목코드로 다시 검색해보세요.</Text></View>
        )}
        {stocks.data?.items.map((stock) => <StockRow key={stock.ticker} stock={stock} />)}
        <Text style={s.disclaimer}>{market === "US" ? "미국 회사 공시를 검색한 결과이며 투자 추천 순위가 아니에요." : `${stocks.data?.source ?? "국내 상장 종목 목록"}이며 투자 추천 순위가 아니에요.`}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StockRow({ stock }: { stock: StockSearchItem }) {
  const positive = (stock.revenue_growth ?? 0) >= 0;
  const summary = stock.operating_income == null
    ? "본업 수익 자료 확인 필요"
    : stock.operating_income > 0 ? "본업에서 돈을 벌고 있어요" : "본업은 아직 적자예요";
  return (
    <Pressable
      accessibilityLabel={`${stock.ticker} ${stock.company} 상세 보기`}
      accessibilityRole="button"
      onPress={() => router.push({ pathname: "/stock/[ticker]", params: { ticker: stock.ticker, market: stock.market ?? "US", exchange: stock.exchange ?? "", company: stock.company } })}
      style={({ pressed }) => [s.row, pressed && s.pressed]}
    >
      <View style={s.symbol}><Text style={s.symbolText}>{stock.ticker.slice(0, 2)}</Text></View>
      <View style={s.rowBody}>
        <Text style={s.ticker}>{stock.ticker}</Text>
        <Text numberOfLines={1} style={s.company}>{stock.company}</Text>
        <Text style={s.summary}>{stock.market === "KR" ? `${stock.exchange ?? "KRX"} 상장 · 가격 조회` : summary}</Text>
      </View>
      {stock.market !== "KR" && <View style={s.metric}>
        <Text style={[s.growth, !positive && s.down]}>{stock.revenue_growth == null ? "—" : `${positive ? "+" : ""}${stock.revenue_growth.toFixed(1)}%`}</Text>
        <Text style={s.metricLabel}>1년 매출 변화</Text>
      </View>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: { minHeight: 62, marginHorizontal: spacing.lg, borderBottomWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center" },
  back: { fontSize: 27, color: colors.ink, marginRight: 14 },
  headerTitle: { fontSize: 19, fontWeight: "900", color: colors.ink },
  count: { marginLeft: "auto", fontSize: 10, fontWeight: "800", color: colors.muted },
  marketTabs: { marginHorizontal: spacing.lg, marginTop: 14, padding: 4, borderRadius: 14, backgroundColor: "#E5D9C3", flexDirection: "row" },
  marketTab: { flex: 1, minHeight: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  marketTabActive: { backgroundColor: colors.ink },
  marketTabText: { fontSize: 11, fontWeight: "900", color: colors.muted },
  marketTabTextActive: { color: colors.paper },
  searchBox: { minHeight: 58, margin: spacing.lg, marginBottom: 8, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.paper, borderWidth: 2, borderColor: colors.ink, flexDirection: "row", alignItems: "center" },
  searchMark: { marginRight: 10, fontSize: 25, color: colors.green },
  input: { flex: 1, fontSize: 16, fontWeight: "800", color: colors.ink, outlineStyle: "none" } as never,
  clear: { paddingHorizontal: 7, fontSize: 25, color: colors.muted },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 40 },
  sectionTitle: { marginTop: 17, fontSize: 18, fontWeight: "900", color: colors.ink },
  sectionHelp: { marginTop: 5, marginBottom: 13, fontSize: 11, lineHeight: 17, color: colors.muted },
  row: { minHeight: 88, paddingVertical: 14, borderTopWidth: 1, borderColor: colors.line, flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.55, transform: [{ translateY: 1 }] },
  symbol: { width: 42, height: 42, marginRight: 12, borderRadius: 13, backgroundColor: "#E7D9BF", alignItems: "center", justifyContent: "center" },
  symbolText: { fontSize: 12, fontWeight: "900", color: colors.soil },
  rowBody: { flex: 1, minWidth: 0 },
  ticker: { fontSize: 15, fontWeight: "900", color: colors.ink },
  company: { marginTop: 2, maxWidth: 190, fontSize: 10, color: colors.muted },
  summary: { marginTop: 5, fontSize: 10, fontWeight: "700", color: colors.green },
  metric: { alignItems: "flex-end", marginLeft: 8 },
  growth: { fontSize: 15, fontWeight: "900", color: colors.green, fontVariant: ["tabular-nums"] },
  down: { color: colors.danger },
  metricLabel: { marginTop: 3, fontSize: 8, color: colors.muted },
  skeleton: { height: 68, marginVertical: 5, borderRadius: 12, backgroundColor: "#E7DCC8" },
  stateBox: { marginTop: 10, padding: 18, borderRadius: 14, backgroundColor: colors.paper },
  stateTitle: { fontSize: 15, fontWeight: "900", color: colors.ink },
  stateText: { marginTop: 6, fontSize: 11, lineHeight: 17, color: colors.muted },
  retry: { marginTop: 13, fontSize: 11, fontWeight: "900", color: colors.green },
  disclaimer: { paddingVertical: 18, fontSize: 9, lineHeight: 14, textAlign: "center", color: colors.muted },
});
