import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { colors, fonts } from "../theme/tokens";
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
    </Pressable>
  );
}
const s = StyleSheet.create({
  button: {
    minHeight: 58,
    backgroundColor: colors.soil,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { transform: [{ translateY: 2 }], opacity: 0.9 },
  text: {
    color: colors.paper,
    fontSize: 17,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
});
