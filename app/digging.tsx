import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { Mole } from "../src/components/Mole";
import { researchApi } from "../src/api/research";
import { useDigStore } from "../src/store/useDigStore";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors, spacing } from "../src/theme/tokens";
export default function Digging() {
  const [stage, setStage] = useState(0),
    [open, setOpen] = useState<number | null>(null);
  const filters = useDigStore((x) => x.filters),
    profile = useDigStore((x) => x.screeningProfile),
    riskProfile = useDigStore((x) => x.riskProfile),
    setDigData = useDigStore((x) => x.setDigData),
    storedStages = useDigStore((x) => x.digStages);
  const depth = useSharedValue(0),
    dirt = useSharedValue(0);
  const { data, error, isLoading } = useQuery({
    queryKey: ["sec-screen", filters, profile, riskProfile],
    queryFn: () => researchApi.runScreen(filters, profile, riskProfile),
    retry: 1,
  });
  const stages = data?.stages ?? storedStages;
  useEffect(() => {
    if (!data) return;
    setDigData(data.results, data.stages);
    setStage(0);
    depth.value = withTiming(1, { duration: 3600 });
    dirt.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 220 }),
        withTiming(0, { duration: 220 }),
      ),
      -1,
    );
    const timer = setInterval(
      () => setStage((x) => Math.min(x + 1, data.stages.length - 1)),
      900,
    );
    return () => clearInterval(timer);
  }, [data, setDigData, depth, dirt]);
  const moleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: depth.value * 45 }],
  }));
  const dirtStyle = useAnimatedStyle(() => ({
    opacity: dirt.value,
    transform: [{ scale: dirt.value * 0.5 + 0.7 }],
  }));
  const complete = !!data && stage === stages.length - 1;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Text style={s.kicker}>종목 찾는 중</Text>
        <Text style={s.step}>02 / 04</Text>
      </View>
      <View style={s.hero}>
        <View>
          <Text style={s.title}>
            {error
              ? "불러오지 못했어요"
              : isLoading
                ? "회사 자료를 보고 있어요"
                : complete
                  ? data.resultMode === "exact"
                    ? `${data.exactMatchCount}개를 찾았어요`
                    : "가까운 후보를 찾았어요"
                  : "조건에 맞춰 고르고 있어요"}
          </Text>
          <Text style={s.hint}>
            {error
              ? "잠시 후 다시 시도해주세요"
              : data
                ? `${data.source} 기준`
                : "최신 자료 확인 중"}
          </Text>
        </View>
        <Animated.View style={moleStyle}>
          <Mole
            mood={error ? "danger" : complete ? "found" : "digging"}
            size={138}
          />
          <Animated.Text style={[s.dirt, dirtStyle]}>•• • ••</Animated.Text>
        </Animated.View>
      </View>
      {error ? (
        <View style={s.errorBox}>
          <Text style={s.errorTitle}>데이터 서버가 꺼져 있어요</Text>
          <Text style={s.errorText}>
            {error instanceof Error ? error.message : "알 수 없는 오류"}
          </Text>
          <Text style={s.errorHelp}>
            PC에서 Stock Digger 데이터 서버를 먼저 켜주세요.
          </Text>
        </View>
      ) : (
        <ScrollView style={s.path} contentContainerStyle={s.pathContent}>
          {stages.map((item, i) => {
            const active = !!data && i <= stage,
              expanded = open === i;
            return (
              <View key={`${item.label}-${item.count}`}>
                <Pressable
                  disabled={!active}
                  onPress={() => setOpen(expanded ? null : i)}
                  style={[s.stage, !active && s.pending]}
                >
                  {active && (
                    <Animated.View
                      entering={FadeIn.duration(250)}
                      style={s.stageRow}
                    >
                      <View style={[s.node, i === stage && s.current]} />
                      <View style={s.stageMain}>
                        <Text style={s.stageLabel}>{item.label}</Text>
                        <Text style={s.removed}>
                          {i === 0
                            ? "전체 종목"
                            : `${item.removed.toLocaleString()}개 제외`}
                        </Text>
                      </View>
                      <Text style={s.count}>{item.count.toLocaleString()}</Text>
                      <Text style={s.chevron}>
                        {item.rejected.length ? (expanded ? "−" : "+") : ""}
                      </Text>
                    </Animated.View>
                  )}
                </Pressable>
                {expanded && (
                  <View style={s.detail}>
                    <Text style={s.explanation}>{item.explanation}</Text>
                    {item.rejected.map((stock) => (
                      <View key={stock.ticker} style={s.rejectRow}>
                        <Text style={s.rejectTicker}>{stock.ticker}</Text>
                        <Text style={s.rejectReason}>{stock.reason}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {i < stages.length - 1 && <View style={s.connector} />}
              </View>
            );
          })}
        </ScrollView>
      )}
      {complete && data.results.length > 0 && (
        <View style={s.footer}>
          <PrimaryButton
            label={
              data.resultMode === "exact"
                ? `후보 ${data.results.length}개 보기`
                : `가까운 후보 ${data.results.length}개 보기`
            }
            onPress={() => router.push("/results")}
          />
        </View>
      )}
      {complete && data.results.length === 0 && (
        <View style={s.footer}>
          <Text style={s.emptyTitle}>조건을 통과한 후보가 없어요</Text>
          <Text style={s.emptyText}>조건을 조금 넓혀보세요.</Text>
          <PrimaryButton
            label="조건 다시 고르기"
            onPress={() => router.replace(profile ? "/conversation" : "/setup")}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  header: {
    marginHorizontal: spacing.lg,
    paddingVertical: 12,
    flexDirection: "row",
  },
  kicker: {
    fontSize: 11,
    fontWeight: "900",
    color: colors.soil,
  },
  step: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: 16,
    height: 150,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  title: { fontSize: 29, lineHeight: 34, fontWeight: "900", color: colors.ink },
  hint: { fontSize: 11, color: colors.muted, marginTop: 7, maxWidth: 230 },
  dirt: {
    position: "absolute",
    left: -8,
    bottom: -3,
    fontSize: 20,
    color: colors.soilLight,
  },
  path: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.soilDark,
    overflow: "hidden",
  },
  pathContent: { padding: spacing.lg },
  stage: { minHeight: 66, justifyContent: "center" },
  pending: { opacity: 0.12 },
  stageRow: { flexDirection: "row", alignItems: "center" },
  node: {
    width: 13,
    height: 13,
    borderRadius: 1,
    backgroundColor: colors.gold,
    borderWidth: 3,
    borderColor: colors.goldLight,
  },
  current: { width: 18, height: 18, borderRadius: 1 },
  stageMain: { marginLeft: 14, flex: 1 },
  stageLabel: { fontSize: 14, fontWeight: "800", color: colors.paper },
  removed: { fontSize: 10, color: "#C7AB91", marginTop: 3 },
  count: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.goldLight,
    minWidth: 45,
    textAlign: "right",
  },
  chevron: { width: 22, textAlign: "right", fontSize: 21, color: colors.paper },
  connector: {
    height: 15,
    width: 2,
    backgroundColor: colors.soilLight,
    marginLeft: 6,
  },
  detail: {
    backgroundColor: colors.soil,
    padding: 14,
    marginVertical: 5,
    marginLeft: 26,
    borderLeftWidth: 2,
    borderColor: colors.gold,
  },
  explanation: {
    fontSize: 12,
    lineHeight: 18,
    color: "#E9D8C3",
    marginBottom: 8,
  },
  rejectRow: {
    flexDirection: "row",
    paddingVertical: 7,
    borderTopWidth: 1,
    borderColor: "#815A40",
  },
  rejectTicker: {
    width: 54,
    fontSize: 12,
    fontWeight: "900",
    color: colors.goldLight,
  },
  rejectReason: { flex: 1, fontSize: 12, color: colors.paper },
  footer: { padding: spacing.md, backgroundColor: colors.paper },
  emptyTitle: { fontSize: 15, fontWeight: "900", color: colors.ink },
  emptyText: {
    marginVertical: 7,
    fontSize: 11,
    lineHeight: 17,
    color: colors.muted,
  },
  errorBox: {
    margin: spacing.lg,
    padding: 20,
    backgroundColor: "#EBD9CC",
    borderLeftWidth: 4,
    borderColor: colors.danger,
  },
  errorTitle: { fontSize: 16, fontWeight: "900", color: colors.danger },
  errorText: { fontSize: 13, color: colors.ink, marginTop: 7 },
  errorHelp: { fontSize: 10, color: colors.muted, marginTop: 12 },
});
