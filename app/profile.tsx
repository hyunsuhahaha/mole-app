import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { calculateRiskProfile, riskQuestions } from "../src/data/riskProfile";
import { goBackOr } from "../src/navigation/goBackOr";
import { useDigStore } from "../src/store/useDigStore";
import { colors, fonts, spacing } from "../src/theme/tokens";

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
        <View>
          <Text style={s.kicker}>먼저 나부터 파악하기</Text>
          <Text style={s.headerTitle}>나의 투자 탐색 성향</Text>
        </View>
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
            <Text style={s.eyebrow}>현재 답변으로 본 성향</Text>
            <Text style={s.resultTitle}>{profile.title}</Text>
            <Text style={s.resultSummary}>{profile.summary}</Text>
            <View style={s.resultBox}>
              <Text style={s.resultBoxTitle}>검색에 이렇게 반영해요</Text>
              <Text style={s.resultBoxText}>
                {profile.level === "stable"
                  ? "흑자·배당·낮은 위험 경로를 먼저 보여주고 적자 회사는 뒤로 보냅니다."
                  : profile.level === "balanced"
                    ? "검증된 성장과 현재 수익성을 함께 보며 한쪽 조건만으로 고르지 않습니다."
                    : "작은 성장 회사와 큰 낙폭 후보도 앞에 보여주되 적자·현금·주식 수 증가 위험을 더 크게 표시합니다."}
              </Text>
            </View>
            <View style={s.notice}>
              <Text style={s.noticeTitle}>꼭 알아두세요</Text>
              <Text style={s.noticeText}>
                이 결과는 정식 투자성향 진단이나 매수 추천이 아니에요. 지금
                답변에 맞춰 후보를 설명하고 정렬하는 용도예요.
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
            <Text style={s.eyebrow}>정답은 없어요</Text>
            <Text style={s.question}>{question.text}</Text>
            <Text style={s.help}>{question.help}</Text>
            <View style={s.options}>
              {question.options.map((option, index) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  onPress={() => answer(option.value)}
                  style={({ pressed }) => [s.option, pressed && s.pressed]}
                >
                  <Text style={s.optionIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </Text>
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
  page: { flex: 1, backgroundColor: colors.cream },
  header: {
    minHeight: 70,
    marginHorizontal: spacing.lg,
    borderBottomWidth: 2,
    borderColor: colors.ink,
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
    height: 3,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.line,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: colors.gold },
  content: { padding: spacing.lg, paddingBottom: 40 },
  eyebrow: {
    marginTop: 18,
    color: colors.green,
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
    borderTopWidth: 2,
    borderColor: colors.ink,
  },
  option: {
    minHeight: 82,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
    alignItems: "center",
  },
  pressed: { backgroundColor: "#E8DDC6" },
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
  arrow: { marginLeft: 10, color: colors.gold, fontSize: 20 },
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
    color: colors.soil,
  },
  resultBox: {
    marginTop: 25,
    padding: 18,
    borderRadius: 1,
    borderWidth: 2,
    borderColor: colors.green,
    backgroundColor: colors.paper,
  },
  resultBoxTitle: { fontSize: 12, fontWeight: "900", color: colors.green },
  resultBoxText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: colors.ink,
  },
  notice: {
    marginTop: 13,
    padding: 15,
    borderRadius: 1,
    borderLeftWidth: 4,
    borderColor: colors.gold,
    backgroundColor: "#E8DDC6",
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
