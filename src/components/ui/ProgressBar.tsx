import React, { useEffect, useState } from "react";
import { StyleSheet, View, Animated, Pressable, Text } from "react-native";
import { COLORS, RADII } from "../../constants/theme";

interface ProgressBarProps {
  progress: number; // 0 to 1
  onBack?: () => void;
}

export default function ProgressBar({ progress, onBack }: ProgressBarProps) {
  const [animatedWidth] = useState(() => new Animated.Value(progress));

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {onBack && (
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </Pressable>
      )}
      
      <View style={styles.barOuter}>
        <Animated.View
          style={[
            styles.barInner,
            {
              width: widthInterpolation,
            },
          ]}
        >
          {/* Subtle light overlay to give a glossy 3D effect */}
          <View style={styles.glossOverlay} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMuted,
  },
  barOuter: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.whiteDark,
    borderRadius: RADII.md,
    overflow: "hidden",
    position: "relative",
  },
  barInner: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    position: "relative",
  },
  glossOverlay: {
    position: "absolute",
    top: 2,
    left: 4,
    right: 4,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: RADII.sm,
  },
});
