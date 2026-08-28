import { router, Stack, usePathname } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../src/theme/tokens";
const client = new QueryClient();
export default function Layout() {
  const pathname = usePathname();
  const showTabs = pathname === "/" || pathname === "/search" || pathname === "/results";
  return (
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }} />
        {showTabs && (
          <View accessibilityRole="tablist" style={styles.tabs}>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: pathname !== "/search" }} onPress={() => router.replace("/")} style={styles.tab}>
              <Text style={[styles.icon, pathname !== "/search" && styles.active]}>⛏</Text>
              <Text style={[styles.label, pathname !== "/search" && styles.active]}>두더지 발굴</Text>
            </Pressable>
            <Pressable accessibilityRole="tab" accessibilityState={{ selected: pathname === "/search" }} onPress={() => router.replace("/search")} style={styles.tab}>
              <Text style={[styles.icon, pathname === "/search" && styles.active]}>⌕</Text>
              <Text style={[styles.label, pathname === "/search" && styles.active]}>종목 조회</Text>
            </Pressable>
          </View>
        )}
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  tabs: { minHeight: 64, paddingBottom: 5, borderTopWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, flexDirection: "row" },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 19, lineHeight: 22, color: colors.muted },
  label: { marginTop: 2, fontSize: 10, fontWeight: "900", color: colors.muted },
  active: { color: colors.green },
});
