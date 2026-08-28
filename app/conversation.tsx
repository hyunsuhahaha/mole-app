import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PrimaryButton } from "../src/components/PrimaryButton";
import {
  buildScreeningProfile,
  getQuestions,
  inferIntent,
  intents,
  type ConversationAnswers,
  type IntentId,
  type RuleBucket,
} from "../src/data/screenerConversation";
import { useDigStore } from "../src/store/useDigStore";
import { colors, fonts, radius, spacing } from "../src/theme/tokens";
import { goBackOr } from "../src/navigation/goBackOr";
import { intentOrderByRisk } from "../src/data/riskProfile";

const examples = [
  "최근 매출이 25% 넘게 크는 회사",
  "매출도 크고 지금 흑자인 회사",
  "돈을 벌면서 주식 수도 많이 안 늘린 회사",
  "적자여도 매출이 빠르게 크는 회사",
];

export default function Conversation() {
  const [query, setQuery] = useState("");
  const [started, setStarted] = useState(false);
  const [intent, setIntent] = useState<IntentId | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<ConversationAnswers>({});
  const setFilter = useDigStore((x) => x.setFilter);
  const riskProfile = useDigStore((x) => x.riskProfile);
  const hasHydrated = useDigStore((x) => x.hasHydrated);
  const setScreeningProfile = useDigStore((x) => x.setScreeningProfile);
  const suggestedIntent = useMemo(() => inferIntent(query), [query]);
  const orderedIntents = useMemo(() => {
    if (!riskProfile) return intents;
    const order = intentOrderByRisk[riskProfile.level];
    return [...intents].sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    );
  }, [riskProfile]);
  const questions = intent ? getQuestions(intent, answers) : [];
  const question = questions[step];
  const complete = !!intent && step >= questions.length;
  const built = useMemo(
    () => intent && buildScreeningProfile(query.trim(), intent, answers),
    [query, intent, answers],
  );

  useEffect(() => {
    if (hasHydrated && !riskProfile) router.replace("/profile");
  }, [hasHydrated, riskProfile]);

  if (!hasHydrated || !riskProfile) return null;

  function start(text = query) {
    const clean = text.trim();
    if (!clean) return;
    setQuery(clean);
    setIntent(null);
    setAnswers({});
    setStarted(true);
    setStep(0);
  }

  function chooseIntent(nextIntent: IntentId) {
    setIntent(nextIntent);
    setAnswers({});
    setStep(0);
  }

  function answer(value: string) {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.key]: value }));
    setStep((current) => current + 1);
  }

  function dig() {
    if (!built) return;
    Object.entries(built.filters).forEach(([key, value]) =>
      setFilter(key as "growth" | "dilution", value),
    );
    setScreeningProfile(built.profile);
    router.push("/digging");
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
        <Text style={s.headerTitle}>조건 찾기</Text>
        <Text style={s.progress}>
          {!started
            ? "시작"
            : !intent
              ? "1 / 6"
              : `${Math.min(step + 2, questions.length + 1)} / ${questions.length + 1}`}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
        >
          {!started ? (
            <>
              <Text style={s.title}>어떤 주식을 찾을까요?</Text>
              <Text style={s.copy}>생각나는 대로 적어보세요</Text>
              <View style={s.inputBox}>
                <TextInput
                  accessibilityLabel="찾고 싶은 회사 설명"
                  multiline
                  onChangeText={setQuery}
                  onSubmitEditing={() => start()}
                  placeholder="예: 매출이 빠르게 크고 지금 흑자인 회사"
                  placeholderTextColor={colors.muted}
                  style={s.input}
                  value={query}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!query.trim()}
                  onPress={() => start()}
                  style={[s.send, !query.trim() && s.sendDisabled]}
                >
                  <Text style={s.sendText}>다음</Text>
                </Pressable>
              </View>
              <Text style={s.exampleLabel}>예시</Text>
              {examples.map((example) => (
                <Pressable
                  accessibilityRole="button"
                  key={example}
                  onPress={() => start(example)}
                  style={s.example}
                >
                  <Text style={s.exampleText}>“{example}”</Text>
                </Pressable>
              ))}
            </>
          ) : !intent ? (
            <>
              <View style={s.userBubble}>
                <Text style={s.userBubbleText}>{query}</Text>
              </View>
              <Text style={s.question}>어떤 쪽에 가까워요?</Text>
              <View style={s.options}>
                {orderedIntents.map((item, index) => {
                  const recommended = suggestedIntent === item.id;
                  const profileRecommended = !suggestedIntent && index === 0;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      key={item.id}
                      onPress={() => chooseIntent(item.id)}
                      style={({ pressed }) => [
                        s.intentOption,
                        (recommended || profileRecommended) &&
                          s.recommendedOption,
                        pressed && s.optionPressed,
                      ]}
                    >
                      <View style={s.intentBody}>
                        <View style={s.intentTitleRow}>
                          <Text style={s.optionText}>{item.title}</Text>
                          {(recommended || profileRecommended) && (
                            <Text style={s.recommend}>성향 추천</Text>
                          )}
                        </View>
                        <Text style={s.intentDescription}>
                          {item.description}
                        </Text>
                      </View>
                      <Text style={s.optionArrow}>→</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() => setStarted(false)}
                style={s.previous}
              >
                <Text style={s.previousText}>← 문장 다시 쓰기</Text>
              </Pressable>
            </>
          ) : complete && built ? (
            <>
              <Text style={s.title}>조건을 정했어요</Text>
              <Text style={s.quote}>“{query}”</Text>
              <Text style={s.selectedIntent}>
                선택한 방향 ·{" "}
                {intents.find((item) => item.id === intent)?.title}
              </Text>
              <View style={s.coverage}>
                <Text style={s.coverageStrong}>
                  답변 {built.profile.answeredCount}개
                </Text>
                <Text style={s.coverageText}>
                  {built.profile.unknownCount
                    ? `${built.profile.unknownCount}개 조건은 건너뛰었어요.`
                    : "이대로 찾아볼게요."}
                </Text>
              </View>
              <RuleGroup
                color={colors.green}
                label="적용할 조건"
                rules={built.profile.must}
              />
              <RuleGroup
                color={colors.gold}
                label="먼저 볼 조건"
                rules={built.profile.prefer}
              />
              <RuleGroup
                color={colors.danger}
                label="더 확인할 조건"
                rules={built.profile.pending}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setStep(Math.max(0, questions.length - 1))}
                style={s.editAnswers}
              >
                <Text style={s.previousText}>← 마지막 답변 고치기</Text>
              </Pressable>
            </>
          ) : (
            <>
              <View style={s.userBubble}>
                <Text style={s.userBubbleText}>{query}</Text>
              </View>
              <View style={s.questionMeta}>
                <SupportBadge bucket={question.bucket} />
              </View>
              <Text style={s.question}>{question.text}</Text>
              <Text style={s.help}>{question.help}</Text>
              <View style={s.options}>
                {question.options.map((item) => (
                  <Pressable
                    accessibilityRole="button"
                    key={item.value}
                    onPress={() => answer(item.value)}
                    style={({ pressed }) => [
                      s.option,
                      pressed && s.optionPressed,
                    ]}
                  >
                    <View style={s.intentBody}>
                      <Text style={s.optionText}>{item.label}</Text>
                      <Text style={s.intentDescription}>{item.note}</Text>
                    </View>
                    <Text style={s.optionArrow}>→</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  step ? setStep((current) => current - 1) : setIntent(null)
                }
                style={s.previous}
              >
                <Text style={s.previousText}>
                  {step ? "← 이전 질문" : "← 방향 다시 고르기"}
                </Text>
              </Pressable>
            </>
          )}
        </ScrollView>
        {complete && (
          <View style={s.footer}>
            <PrimaryButton label="이 조건으로 찾아보기" onPress={dig} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SupportBadge({ bucket }: { bucket: RuleBucket }) {
  const label =
    bucket === "must"
      ? "실제 검색 반영"
      : bucket === "prefer"
        ? "후보에서 확인"
        : "추가 확인 항목";
  return (
    <Text
      style={[
        s.supportBadge,
        bucket === "must"
          ? s.supportApplied
          : bucket === "prefer"
            ? s.supportReview
            : s.supportPending,
      ]}
    >
      {label}
    </Text>
  );
}

function RuleGroup({
  color,
  label,
  rules,
}: {
  color: string;
  label: string;
  rules: string[];
}) {
  return (
    <View style={s.ruleGroup}>
      <View style={[s.ruleMark, { backgroundColor: color }]} />
      <View style={s.ruleBody}>
        <Text style={s.ruleLabel}>{label}</Text>
        {rules.map((rule) => (
          <Text key={rule} style={s.ruleText}>
            • {rule}
          </Text>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  flex: { flex: 1 },
  header: {
    marginHorizontal: spacing.lg,
    minHeight: 70,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  back: { fontSize: 27, color: colors.ink },
  kicker: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  headerTitle: { color: colors.ink, fontSize: 20, fontFamily: fonts.bold },
  progress: { marginLeft: "auto", fontSize: 11, color: colors.muted },
  content: { padding: spacing.lg, paddingTop: 40, paddingBottom: 36 },
  title: {
    marginTop: 20,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -1.4,
    fontFamily: fonts.bold,
    color: colors.ink,
  },
  copy: { marginTop: 14, fontSize: 14, lineHeight: 21, color: colors.muted },
  inputBox: {
    marginTop: 24,
    padding: 16,
    minHeight: 150,
    borderRadius: radius.lg,
    backgroundColor: colors.cream,
  },
  input: {
    flex: 1,
    minHeight: 75,
    color: colors.ink,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "700",
    textAlignVertical: "top",
  },
  send: {
    alignSelf: "flex-end",
    backgroundColor: colors.soil,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  sendDisabled: { opacity: 0.25 },
  sendText: { color: colors.paper, fontSize: 12, fontWeight: "900" },
  exampleLabel: {
    marginTop: 26,
    marginBottom: 8,
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  example: { paddingVertical: 12, borderTopWidth: 1, borderColor: colors.line },
  exampleText: { color: colors.ink, fontSize: 13, fontWeight: "700" },
  userBubble: {
    alignSelf: "flex-end",
    maxWidth: "88%",
    marginTop: 12,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: colors.soil,
  },
  userBubbleText: { color: colors.paper, fontSize: 13, lineHeight: 19 },
  moleLabel: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  questionMeta: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  supportBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 1,
    overflow: "hidden",
    fontSize: 8,
    fontWeight: "900",
  },
  supportApplied: { backgroundColor: "#DCE7D4", color: colors.green },
  supportReview: { backgroundColor: "#EEE0B9", color: colors.soil },
  supportPending: { backgroundColor: "#EBD9CC", color: colors.danger },
  question: {
    marginTop: 8,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.ink,
  },
  help: { marginTop: 8, fontSize: 13, lineHeight: 19, color: colors.muted },
  options: { marginTop: 22, gap: 12 },
  profileStrip: {
    marginTop: 16,
    padding: 12,
    borderLeftWidth: 4,
    borderColor: colors.gold,
    backgroundColor: "#E8DDC6",
  },
  profileStripTitle: { color: colors.green, fontSize: 11, fontWeight: "900" },
  profileStripText: { marginTop: 3, color: colors.muted, fontSize: 10 },
  option: {
    minHeight: 57,
    paddingHorizontal: 17,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
  },
  intentOption: {
    minHeight: 76,
    paddingHorizontal: 17,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
    flexDirection: "row",
    alignItems: "center",
  },
  recommendedOption: { borderWidth: 1.5, borderColor: colors.soil },
  disabledOption: { opacity: 0.5, backgroundColor: "#E9E3D8" },
  intentBody: { flex: 1 },
  intentTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  intentDescription: { marginTop: 5, color: colors.muted, fontSize: 11 },
  recommend: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.soil,
    color: colors.paper,
    fontSize: 8,
    fontWeight: "900",
  },
  soon: { color: colors.danger, fontSize: 8, fontWeight: "900" },
  optionPressed: { backgroundColor: "#EAEDF0" },
  optionText: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "800" },
  optionArrow: { color: colors.soil, fontSize: 20 },
  previous: { alignSelf: "flex-start", paddingVertical: 18 },
  previousText: { color: colors.muted, fontSize: 12, fontWeight: "800" },
  quote: {
    marginTop: 14,
    color: colors.soil,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "800",
  },
  selectedIntent: {
    marginTop: 7,
    marginBottom: 18,
    color: colors.green,
    fontSize: 11,
    fontWeight: "900",
  },
  coverage: {
    marginBottom: 12,
    padding: 13,
    borderRadius: radius.md,
    backgroundColor: colors.cream,
  },
  coverageStrong: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  coverageText: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 10,
    lineHeight: 16,
  },
  editAnswers: { alignSelf: "flex-start", paddingVertical: 16 },
  ruleGroup: {
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
  },
  ruleMark: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  ruleBody: { flex: 1, marginLeft: 11 },
  ruleLabel: { color: colors.muted, fontSize: 10, fontWeight: "900" },
  ruleText: {
    marginTop: 6,
    color: colors.ink,
    fontSize: 13,
    fontWeight: "800",
  },
  notice: {
    marginTop: 12,
    padding: 15,
    borderRadius: 1,
    borderLeftWidth: 4,
    borderColor: colors.gold,
    backgroundColor: "#E8DDC6",
  },
  noticeTitle: { color: colors.ink, fontSize: 12, fontWeight: "900" },
  noticeText: {
    marginTop: 5,
    color: colors.muted,
    fontSize: 11,
    lineHeight: 17,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
});
