import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export type MoleMood =
  | "idle"
  | "digging"
  | "suspicious"
  | "danger"
  | "excited"
  | "found";

const images = {
  idle: require("../../assets/moles/mole-idle.png"),
  digging: require("../../assets/moles/mole-digging.png"),
  suspicious: require("../../assets/moles/mole-suspicious.png"),
  danger: require("../../assets/moles/mole-danger.png"),
  excited: require("../../assets/moles/mole-found.png"),
  found: require("../../assets/moles/mole-found.png"),
} as const;

const labels: Record<MoleMood, string> = {
  idle: "웃고 있는 두더지",
  digging: "열심히 땅을 파는 두더지",
  suspicious: "자료를 의심해 보는 두더지",
  danger: "위험을 발견한 두더지",
  excited: "기뻐하는 두더지",
  found: "회사를 찾아낸 두더지",
};

export function Mole({
  mood = "idle",
  size = 180,
}: {
  mood?: MoleMood;
  size?: number;
}) {
  const motion = useSharedValue(0);

  useEffect(() => {
    motion.value = 0;
    const duration = mood === "digging" ? 180 : mood === "danger" ? 260 : 850;
    motion.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(motion);
  }, [mood, motion]);

  const animatedStyle = useAnimatedStyle(() => {
    const digging = mood === "digging";
    const alert = mood === "danger";
    const celebrating = mood === "found" || mood === "excited";
    return {
      transform: [
        {
          translateY: digging
            ? motion.value * 5
            : celebrating
              ? -motion.value * 3
              : -motion.value * 1.5,
        },
        { rotate: alert ? `${(motion.value - 0.5) * 3}deg` : "0deg" },
        { scale: celebrating ? 1 + motion.value * 0.025 : 1 },
      ],
    };
  });

  return (
    <View
      accessibilityLabel={labels[mood]}
      style={[styles.frame, { width: size, height: size }]}
    >
      <Animated.Image
        source={images[mood]}
        resizeMode="contain"
        style={[styles.image, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  image: { width: "100%", height: "100%" },
});
