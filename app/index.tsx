import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Mole } from "../src/components/Mole";
import { PrimaryButton } from "../src/components/PrimaryButton";
import { colors, spacing } from "../src/theme/tokens";
export default function Home() {
  return (
    <SafeAreaView style={s.page}>
      <View style={s.brand}>
        <View style={s.mark} />
        <Text style={s.brandText}>주식 발굴 연습장</Text>
        <Text style={s.issue}>주식 초보용</Text>
      </View>
      <View style={s.hero}>
        <Text style={s.eyebrow}>어려운 숫자는 두더지가</Text>
        <Text style={s.title}>조건만 고르면{`\n`}쉽게 추려줘요.</Text>
        <Text style={s.copy}>
          잘 몰라도 괜찮아요. 원하는 기준을 고르면 탈락 이유까지 쉽게
          보여드려요.
        </Text>
        <Mole mood="idle" size={210} />
      </View>
      <PrimaryButton
        label="내 조건 만들기"
        onPress={() => router.push("/setup")}
      />
      <Text style={s.disclaimer}>
        초보자를 위한 학습 도구 · 투자 권유가 아닙니다
      </Text>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, padding: spacing.lg },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  mark: {
    width: 12,
    height: 12,
    borderRadius: 7,
    backgroundColor: colors.gold,
    marginRight: 8,
  },
  brandText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.8,
    color: colors.ink,
  },
  issue: {
    marginLeft: "auto",
    fontSize: 10,
    color: colors.muted,
    fontWeight: "700",
  },
  hero: { flex: 1, justifyContent: "center", alignItems: "center" },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 39,
    lineHeight: 43,
    textAlign: "center",
    fontWeight: "900",
    color: colors.ink,
    letterSpacing: -1.5,
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: colors.muted,
    maxWidth: 310,
    marginVertical: 16,
  },
  disclaimer: {
    textAlign: "center",
    fontSize: 11,
    color: colors.muted,
    marginTop: 10,
  },
});
