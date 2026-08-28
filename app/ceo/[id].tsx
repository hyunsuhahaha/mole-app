import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ceos, formatStatementDate } from "../../src/data/ceos";
import { colors, fonts, radius, spacing } from "../../src/theme/tokens";
import { goBackOr } from "../../src/navigation/goBackOr";

export default function CeoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ceo = ceos.find((item) => item.id === id) ?? ceos[0];
  const statement = ceo.statement;
  return (
    <SafeAreaView style={s.page}>
      <View style={s.header}>
        <Pressable accessibilityLabel="뒤로 가기" hitSlop={12} onPress={() => goBackOr("/investors")}><Text style={s.back}>←</Text></Pressable>
        <Text style={s.headerTitle}>CEO 발언</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        <Text style={s.name}>{ceo.name}</Text>
        <Text style={s.role}>{ceo.company} · {ceo.role} · {ceo.ticker}</Text>
        <View style={s.dateLine}><Text style={s.date}>{formatStatementDate(statement.date)}</Text><Text style={s.sourceType}>{statement.sourceType}</Text></View>
        <Text style={s.headline}>{statement.headline}</Text>
        <Text style={s.summary}>{statement.summary}</Text>
        <View style={s.factBox}><Text style={s.factLabel}>같이 확인한 숫자</Text><Text style={s.fact}>{statement.fact}</Text></View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>관련 종목·주제</Text>
          <View style={s.tags}>{statement.related.map((item) => <Text key={item} style={s.tag}>{item}</Text>)}</View>
        </View>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(statement.source)} style={({ pressed }) => [s.sourceButton, pressed && s.pressed]}>
          <Text style={s.sourceButtonText}>공식 원문 보기</Text><Text style={s.sourceArrow}>↗</Text>
        </Pressable>
        <View style={s.note}><Text style={s.noteTitle}>발언은 전망이에요</Text><Text style={s.noteText}>경영진의 판단이 실제 실적이나 주가를 보장하지 않아요.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper },
  header: { width: "100%", maxWidth: 768, minHeight: 64, paddingHorizontal: spacing.lg, alignSelf: "center", flexDirection: "row", alignItems: "center" },
  back: { fontSize: 27, color: colors.ink },
  headerTitle: { marginLeft: 14, fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  content: { width: "100%", maxWidth: 768, alignSelf: "center", paddingHorizontal: spacing.lg, paddingTop: 26, paddingBottom: 48 },
  name: { fontSize: 34, lineHeight: 42, letterSpacing: -1, fontFamily: fonts.bold, color: colors.ink },
  role: { marginTop: 6, fontSize: 12, fontFamily: fonts.medium, color: colors.muted },
  dateLine: { marginTop: 40, flexDirection: "row", alignItems: "center", gap: 8 },
  date: { fontSize: 11, fontFamily: fonts.semibold, color: colors.muted },
  sourceType: { fontSize: 10, fontFamily: fonts.semibold, color: colors.soil },
  headline: { marginTop: 12, fontSize: 26, lineHeight: 36, letterSpacing: -0.6, fontFamily: fonts.bold, color: colors.ink },
  summary: { marginTop: 16, fontSize: 15, lineHeight: 24, fontFamily: fonts.regular, color: colors.muted },
  factBox: { marginTop: 30, padding: 18, borderRadius: radius.md, backgroundColor: colors.cream },
  factLabel: { fontSize: 10, fontFamily: fonts.semibold, color: colors.muted },
  fact: { marginTop: 7, fontSize: 15, lineHeight: 22, fontFamily: fonts.bold, color: colors.ink },
  section: { marginTop: 30 },
  sectionTitle: { fontSize: 14, fontFamily: fonts.bold, color: colors.ink },
  tags: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.cream, fontSize: 11, fontFamily: fonts.semibold, color: colors.soil },
  sourceButton: { minHeight: 56, marginTop: 32, paddingHorizontal: 18, borderRadius: radius.md, backgroundColor: colors.soil, flexDirection: "row", alignItems: "center" },
  sourceButtonText: { flex: 1, fontSize: 14, fontFamily: fonts.bold, color: colors.paper },
  sourceArrow: { fontSize: 18, color: colors.paper },
  pressed: { opacity: 0.65 },
  note: { marginTop: 28, paddingTop: 20, borderTopWidth: 1, borderColor: colors.line },
  noteTitle: { fontSize: 12, fontFamily: fonts.bold, color: colors.ink },
  noteText: { marginTop: 6, fontSize: 11, lineHeight: 18, fontFamily: fonts.regular, color: colors.muted },
});
