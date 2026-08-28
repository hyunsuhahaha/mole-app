import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { goBackOr } from "../src/navigation/goBackOr";
import { colors, spacing } from "../src/theme/tokens";

const items = [
  [
    "수집하는 정보",
    "현재 앱은 회원가입, 광고, 결제, 위치 정보, 연락처 및 투자 계좌 연결 기능이 없습니다.",
  ],
  [
    "서버로 보내는 정보",
    "검색에 필요한 매출 성장률, 흑자 여부, 주식 수 증가 한도, 찾는 방향, 위험 성향과 선택한 가격·배당·회사 크기 기준을 서버로 보냅니다. 자유롭게 입력한 문장과 성향 질문의 원래 답변은 보내지 않습니다.",
  ],
  [
    "기술 로그",
    "서비스 운영 환경은 보안과 장애 대응을 위해 IP 주소, 요청 시각, 기기·브라우저 정보를 일시적으로 기록할 수 있습니다.",
  ],
  [
    "제3자 자료",
    "회사가 미국 SEC에 제출한 공개 공시를 사용합니다. Stock Digger는 SEC와 제휴하거나 승인받은 서비스가 아닙니다.",
  ],
  [
    "보관과 삭제",
    "관심 회사, 기본 검색 조건과 투자 탐색 성향은 이 기기에만 저장됩니다. 계정이나 서버에는 저장하지 않으며 앱 데이터를 삭제하면 함께 지워집니다. 운영 로그의 보관 기간과 문의처는 실제 출시 운영자·호스팅 확정 후 공개 정책 URL에 명시합니다.",
  ],
];

export default function Privacy() {
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
        <Text style={s.headerTitle}>개인정보 안내</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>현재 앱이 다루는 정보</Text>
        <Text style={s.intro}>
          이 화면은 앱 내 요약입니다. App Store 제출 전 운영자 정보와 공개 정책
          URL을 확정해야 합니다.
        </Text>
        {items.map(([title, body]) => (
          <View key={title} style={s.item}>
            <Text style={s.itemTitle}>{title}</Text>
            <Text style={s.body}>{body}</Text>
          </View>
        ))}
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
  headerTitle: { fontSize: 20, fontWeight: "900", color: colors.ink },
  content: { padding: spacing.lg, paddingBottom: 40 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: "900", color: colors.ink },
  intro: {
    marginTop: 12,
    marginBottom: 18,
    fontSize: 13,
    lineHeight: 20,
    color: colors.danger,
  },
  item: { paddingVertical: 17, borderTopWidth: 1, borderColor: colors.line },
  itemTitle: { fontSize: 15, fontWeight: "900", color: colors.ink },
  body: { marginTop: 7, fontSize: 12, lineHeight: 19, color: colors.muted },
});
