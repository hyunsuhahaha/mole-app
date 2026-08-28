import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useDigStore, Filters } from "../src/store/useDigStore";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors, radius, spacing } from "../src/theme/tokens";
import { goBackOr } from "../src/navigation/goBackOr";
const basic: [keyof Filters, string, string[]][] = [
  [
    "style",
    "어떤 회사를 찾을까요?",
    ["빠르게 크는 회사", "꾸준히 버는 회사", "가격이 싼 회사"],
  ],
  ["industry", "관심 있는 분야", ["모두 보기", "기술", "헬스케어"]],
  ["cap", "회사 크기", ["작은 회사", "중간 회사", "큰 회사"]],
  ["growth", "매출이 얼마나 늘었나요?", ["10% 이상", "15% 이상", "25% 이상"]],
  ["horizon", "얼마나 오래 볼까요?", ["1–2년", "3–5년", "5년 이상"]],
];
const advanced: [keyof Filters, string, string[]][] = [
  ["lossAllowed", "적자 회사도 볼까요?", ["포함", "곧 흑자만", "제외"]],
  [
    "dilution",
    "주식 수를 자주 늘린 회사",
    ["많이 늘리면 제외", "조금은 허용", "상관없음"],
  ],
  [
    "runup",
    "최근 너무 오른 종목",
    ["급등하면 제외", "200% 이상만 제외", "상관없음"],
  ],
  [
    "cashRunway",
    "현금으로 버틸 수 있는 기간",
    ["18개월 이상", "12개월 이상", "상관없음"],
  ],
  [
    "catalyst",
    "앞으로 중요한 일정",
    ["꼭 있어야 함", "있으면 가점", "상관없음"],
  ],
];
function ChoiceGroup({
  item,
  index,
}: {
  item: [keyof Filters, string, string[]];
  index: number;
}) {
  const [key, label, options] = item,
    filters = useDigStore((x) => x.filters),
    setFilter = useDigStore((x) => x.setFilter);
  return (
    <View style={s.group}>
      <View style={s.labelRow}>
        <Text style={s.number}>{String(index).padStart(2, "0")}</Text>
        <Text style={s.label}>{label}</Text>
      </View>
      <View style={s.options}>
        {options.map((option) => {
          const selected = filters[key] === option;
          return (
            <Pressable
              key={option}
              onPress={() => setFilter(key, option)}
              style={[s.option, selected && s.selected]}
            >
              <Text style={[s.optionText, selected && s.selectedText]}>
                {option}
              </Text>
              {selected && <Text style={s.check}>●</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
export default function Setup() {
  const riskProfile = useDigStore((state) => state.riskProfile);
  const hasHydrated = useDigStore((state) => state.hasHydrated);
  const [deep, setDeep] = useState(false);
  useEffect(() => {
    if (hasHydrated && !riskProfile) router.replace("/profile?next=setup");
  }, [hasHydrated, riskProfile]);
  if (!hasHydrated || !riskProfile) return null;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          onPress={() => goBackOr("/")}
          hitSlop={12}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.title}>조건 고르기</Text>
        <Text style={s.step}>01 / 04</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {basic.map((item, i) => (
          <ChoiceGroup key={item[0]} item={item} index={i + 1} />
        ))}
        <Pressable style={s.deepButton} onPress={() => setDeep((x) => !x)}>
          <View>
            <Text style={s.deepTitle}>
              {deep ? "조건 접기" : "조건 더 보기"}
            </Text>
          </View>
          <Text style={s.deepArrow}>{deep ? "↑" : "↓"}</Text>
        </Pressable>
        {deep && (
          <View style={s.deepArea}>
            {advanced.map((item, i) => (
              <ChoiceGroup
                key={item[0]}
                item={item}
                index={basic.length + i + 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <PrimaryButton
        label="종목 찾기"
        onPress={() => router.push("/digging")}
      />
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, padding: spacing.lg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 16,
  },
  back: { fontSize: 28, color: colors.ink },
  kicker: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.8,
    color: colors.green,
  },
  title: { fontSize: 24, fontWeight: "900", color: colors.ink },
  step: {
    marginLeft: "auto",
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
  },
  content: { paddingBottom: 24 },
  intro: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.muted,
    paddingVertical: 16,
  },
  group: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 11 },
  number: { fontSize: 11, color: colors.gold, fontWeight: "900", width: 28 },
  label: { fontSize: 15, fontWeight: "800", color: colors.ink },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.cream,
  },
  selected: { backgroundColor: colors.soil, borderColor: colors.soil },
  optionText: { fontSize: 13, fontWeight: "700", color: colors.muted },
  selectedText: { color: colors.paper },
  check: { fontSize: 8, color: colors.goldLight },
  deepButton: {
    marginTop: 20,
    backgroundColor: colors.cream,
    padding: 18,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  deepKicker: {
    fontSize: 10,
    color: colors.goldLight,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  deepTitle: {
    fontSize: 20,
    color: colors.ink,
    fontWeight: "900",
    marginTop: 3,
  },
  deepArrow: { marginLeft: "auto", fontSize: 24, color: colors.soil },
  deepArea: { paddingTop: 8 },
  deepNotice: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    paddingVertical: 14,
  },
});
