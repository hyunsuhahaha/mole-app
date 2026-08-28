import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { calculateRiskProfile, riskQuestions } from "../src/data/riskProfile";
import { goBackOr } from "../src/navigation/goBackOr";
import { useDigStore } from "../src/store/useDigStore";
import { colors, fonts, radius, spacing } from "../src/theme/tokens";

export default function Profile() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const setRiskProfile = useDigStore((state) => state.setRiskProfile);
  const complete = step >= riskQuestions.length;
  const question = riskQuestions[step];
  const profile = useMemo(() => calculateRiskProfile(answers), [answers]);

  function answer(value: string) {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.key]: value }));
    setStep((current) => current + 1);
  }

  function continueToSearch() {
    setRiskProfile(profile);
    router.replace(next === "setup" ? "/setup" : "/conversation");
  }

  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => goBackOr("/")}
        >
          <Text style={s.back}>←</Text>
        </Pressable>
        <Text style={s.headerTitle}>투자 성향</Text>
        <Text style={s.progress}>
          {complete ? "완료" : `${step + 1} / ${riskQuestions.length}`}
        </Text>
      </View>
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            {
              width: `${complete ? 100 : ((step + 1) / riskQuestions.length) * 100}%`,
            },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {complete ? (
          <>
            <Text style={s.eyebrow}>내 투자 성향</Text>
            <Text style={s.resultTitle}>{profile.title}</Text>
            <Text style={s.resultSummary}>{profile.summary}</Text>
            <View style={s.resultBox}>
              <Text style={s.resultBoxTitle}>종목을 찾을 때</Text>
              <Text style={s.resultBoxText}>
                {profile.level === "stable"
                  ? "돈을 벌고 재무가 안정적인 회사를 먼저 봐요."
                  : profile.level === "balanced"
                    ? "성장성과 안정성을 함께 봐요."
                    : "성장 가능성을 넓게 보고 위험도 함께 표시해요."}
              </Text>
            </View>
            <View style={s.notice}>
              <Text style={s.noticeText}>
                투자 권유가 아닌 종목 탐색 기준이에요.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setStep(riskQuestions.length - 1)}
              style={s.previous}
            >
              <Text style={s.previousText}>← 마지막 답변 고치기</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={s.question}>{question.text}</Text>
            <Text style={s.help}>{question.help}</Text>
            <View style={s.options}>
              {question.options.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => answer(option.value)}
                  style={({ pressed }) => [s.option, pressed && s.pressed]}
                >
                  <View style={s.optionBody}>
                    <Text style={s.optionLabel}>{option.label}</Text>
                    <Text style={s.optionNote}>{option.note}</Text>
                  </View>
                  <Text style={s.arrow}>→</Text>
                </Pressable>
              ))}
            </View>
            {step > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep((current) => current - 1)}
                style={s.previous}
              >
                <Text style={s.previousText}>← 이전 질문</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
      {complete && (
        <View style={s.footer}>
          <PrimaryButton
            label={
              next === "setup"
                ? "이 성향으로 조건 직접 고르기"
                : "이 성향으로 회사 찾기"
            }
            onPress={continueToSearch}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  header: {
    minHeight: 70,
    marginHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  back: { fontSize: 27, color: colors.ink },
  kicker: {
    color: colors.green,
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1.4,
  },
  headerTitle: { color: colors.ink, fontSize: 20, fontFamily: fonts.bold },
  progress: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  progressTrack: {
    height: 4,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.line,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.soil },
  content: { padding: spacing.lg, paddingTop: 40, paddingBottom: 40 },
  eyebrow: {
    marginTop: 18,
    color: colors.muted,
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 1.3,
  },
  question: {
    marginTop: 9,
    fontSize: 31,
    lineHeight: 37,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  help: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  options: {
    marginTop: 25,
    gap: 12,
  },
  option: {
    minHeight: 80,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: { backgroundColor: "#EAEDF0" },
  optionIndex: {
    width: 38,
    marginRight: 9,
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.gold,
    fontVariant: ["tabular-nums"],
  },
  optionBody: { flex: 1 },
  optionLabel: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  optionNote: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: fonts.regular,
    color: colors.muted,
  },
  arrow: { marginLeft: 10, color: colors.soil, fontSize: 20 },
  previous: { alignSelf: "flex-start", paddingVertical: 20 },
  previousText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  resultTitle: {
    marginTop: 9,
    fontSize: 39,
    lineHeight: 45,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  resultSummary: {
    marginTop: 13,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: fonts.semibold,
    color: colors.muted,
  },
  resultBox: {
    marginTop: 25,
    padding: 18,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  resultBoxTitle: { fontSize: 12, fontWeight: "900", color: colors.soil },
  resultBoxText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },
  notice: {
    marginTop: 13,
    padding: 15,
    borderRadius: radius.md,
    backgroundColor: "#FFF6E0",
  },
  noticeTitle: { fontSize: 11, fontWeight: "900", color: colors.ink },
  noticeText: {
    marginTop: 5,
    fontSize: 10,
    lineHeight: 16,
    color: colors.muted,
  },
  footer: { padding: spacing.md, borderTopWidth: 1, borderColor: colors.line },
});
