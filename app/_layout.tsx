import { router, Stack, usePathname } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { IBMPlexSansKR_400Regular } from "@expo-google-fonts/ibm-plex-sans-kr/400Regular";
import { IBMPlexSansKR_500Medium } from "@expo-google-fonts/ibm-plex-sans-kr/500Medium";
import { IBMPlexSansKR_600SemiBold } from "@expo-google-fonts/ibm-plex-sans-kr/600SemiBold";
import { IBMPlexSansKR_700Bold } from "@expo-google-fonts/ibm-plex-sans-kr/700Bold";
import { useFonts } from "expo-font";
import { colors, fonts } from "../src/theme/tokens";
const client = new QueryClient();
export default function Layout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold,
    IBMPlexSansKR_700Bold,
  });
  const pathname = usePathname();
  const showTabs =
    pathname === "/" || pathname === "/search" || pathname === "/results";
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={client}>
      <StatusBar style="dark" />
      <View style={styles.shell}>
        <View style={styles.appSurface}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
        </View>
        {showTabs && (
          <View style={styles.tabRail}>
            <View accessibilityRole="tablist" style={styles.tabs}>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: pathname !== "/search" }}
                onPress={() => router.replace("/")}
                style={styles.tab}
              >
                {pathname !== "/search" && <View style={styles.activeMark} />}
                <Text
                  style={[styles.icon, pathname !== "/search" && styles.active]}
                >
                  ⛏
                </Text>
                <Text
                  style={[
                    styles.label,
                    pathname !== "/search" && styles.active,
                  ]}
                >
                  두더지 발굴
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: pathname === "/search" }}
                onPress={() => router.replace("/search")}
                style={styles.tab}
              >
                {pathname === "/search" && <View style={styles.activeMark} />}
                <Text
                  style={[styles.icon, pathname === "/search" && styles.active]}
                >
                  ⌕
                </Text>
                <Text
                  style={[
                    styles.label,
                    pathname === "/search" && styles.active,
                  ]}
                >
                  종목 조회
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.cream },
  appSurface: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    backgroundColor: colors.cream,
  },
  tabRail: {
    width: "100%",
    borderTopWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  tabs: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    minHeight: 64,
    paddingBottom: 5,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeMark: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.soil,
  },
  icon: { fontSize: 19, lineHeight: 22, color: colors.muted },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontFamily: fonts.bold,
    color: colors.muted,
  },
  active: { color: colors.soil },
});
