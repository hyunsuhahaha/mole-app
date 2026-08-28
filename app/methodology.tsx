import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBackOr } from "../src/navigation/goBackOr";
import { colors, spacing } from "../src/theme/tokens";

const sections = [
  {
    number: "01",
    title: "무엇을 실제로 거르나요?",
    body: "미국 SEC에 제출된 최근 회사 자료에서 전년 같은 분기 대비 매출 성장률, 최근 분기 영업 흑자 여부, 1년 주식 수 증가율을 확인합니다.",
  },
  {
    number: "02",
    title: "자료 일치도는 어떻게 계산하나요?",
    body: "62 + 매출 성장률×0.55 - 주식 수 증가율×0.8 + 영업 흑자 5점으로 시작해 위험 단서마다 3점을 뺍니다. 35~95점 안에서 표시하며 투자 수익 가능성 점수가 아닙니다.",
  },
  {
    number: "03",
    title: "지금 보지 못하는 것은?",
    body: "가격이 필요한 검색은 무료 시세 범위 안에서 상위 후보 4개를 추가 확인합니다. 순현금, 고객 집중도, 뉴스와 향후 일정은 아직 자동 판정하지 않습니다.",
  },
  {
    number: "04",
    title: "검색 범위는 얼마나 되나요?",
    body: "재무 조건 발굴은 미국 SEC 공시 기업 4,474개를 대상으로 하며 결과 화면에 실제 범위를 표시합니다. 국내는 상장 종목 3,274개를 별도 검색하고 가격을 볼 수 있지만, OpenDART 재무자료 연결 전에는 미국 회사와 섞어 점수화하지 않습니다.",
  },
  {
    number: "05",
    title: "투자자 발언은 어떻게 다루나요?",
    body: "X 게시물, 인터뷰와 발표는 공개 발언 또는 의견으로만 표시합니다. 회사가 제출한 재무 사실과 섞어 점수화하지 않고 원문 링크와 날짜를 함께 보여줍니다.",
  },
];

export default function Methodology() {
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
          <Text style={s.kicker}>투명한 발굴</Text>
          <Text style={s.headerTitle}>데이터와 판단 기준</Text>
        </View>
      </View>
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>두더지가 보는 것과{`\n`}보지 못하는 것</Text>
        <Text style={s.intro}>
          Stock Digger는 매수 추천기가 아니라 조건에 맞는 회사를 좁혀보는 학습용
          스크리너입니다.
        </Text>
        {sections.map((section) => (
          <View key={section.number} style={s.section}>
            <Text style={s.number}>{section.number}</Text>
            <View style={s.sectionBody}>
              <Text style={s.sectionTitle}>{section.title}</Text>
              <Text style={s.sectionText}>{section.body}</Text>
            </View>
          </View>
        ))}
        <Pressable
          accessibilityRole="link"
          onPress={() =>
            Linking.openURL(
              "https://www.sec.gov/search-filings/edgar-application-programming-interfaces",
            )
          }
          style={s.source}
        >
          <Text style={s.sourceLabel}>공식 데이터 출처</Text>
          <Text style={s.sourceText}>SEC EDGAR API 문서 ↗</Text>
        </Pressable>
        <Text style={s.disclaimer}>
          조건에 맞는 회사를 좁혀 보는 정보 도구이며 투자 권유가 아닙니다. 모든
          투자에는 원금 손실 위험이 있으며 데이터는 지연되거나 오류가 있을 수
          있습니다.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  header: {
    marginHorizontal: spacing.lg,
    minHeight: 70,
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
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  headerTitle: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: {
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.2,
    fontWeight: "900",
    color: colors.ink,
  },
  intro: {
    marginTop: 13,
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
  },
  section: {
    paddingVertical: 17,
    borderTopWidth: 1,
    borderColor: colors.line,
    flexDirection: "row",
  },
  number: { width: 34, color: colors.gold, fontSize: 10, fontWeight: "900" },
  sectionBody: { flex: 1 },
  sectionTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  sectionText: {
    marginTop: 7,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
  },
  source: {
    marginTop: 8,
    padding: 15,
    borderLeftWidth: 4,
    borderColor: colors.gold,
    backgroundColor: colors.soil,
    flexDirection: "row",
    alignItems: "center",
  },
  sourceLabel: { color: colors.goldLight, fontSize: 10, fontWeight: "900" },
  sourceText: {
    marginLeft: "auto",
    color: colors.paper,
    fontSize: 11,
    fontWeight: "800",
  },
  disclaimer: {
    marginTop: 18,
    color: colors.danger,
    fontSize: 10,
    lineHeight: 16,
    fontWeight: "700",
  },
});
