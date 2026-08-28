import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme/tokens";
export function PrimaryButton({
  label,
  onPress,
  style,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.button, pressed && s.pressed, style]}
    >
      <Text style={s.text}>{label}</Text>
      <Text style={s.arrow}>→</Text>
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 58,
    backgroundColor: colors.ink,
    borderRadius: 12,
    borderTopWidth: 3,
    borderColor: colors.gold,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: { transform: [{ translateY: 2 }], opacity: 0.9 },
  text: {
    color: colors.paper,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  arrow: { color: colors.goldLight, fontSize: 24 },
});
