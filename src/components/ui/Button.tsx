import React from "react";
import { StyleSheet, Text, Pressable, View, ViewStyle, TextStyle } from "react-native";
import { COLORS, TYPOGRAPHY, RADII } from "../../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "accent" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  style,
}: ButtonProps) {
  
  const getColors = () => {
    if (disabled) {
      return {
        bg: "#e5e5e5",
        shadow: "#afafaf",
        text: "#afafaf",
      };
    }
    
    switch (variant) {
      case "primary":
        return {
          bg: COLORS.primary,
          shadow: COLORS.primaryDark,
          text: COLORS.onPrimary,
        };
      case "accent":
        return {
          bg: COLORS.accent,
          shadow: COLORS.accentDark,
          text: COLORS.white,
        };
      case "secondary":
        return {
          bg: COLORS.white,
          shadow: COLORS.borderDark,
          text: COLORS.accent,
          border: COLORS.border,
        };
      case "danger":
        return {
          bg: COLORS.error,
          shadow: COLORS.errorDark,
          text: COLORS.white,
        };
      case "ghost":
        return {
          bg: "transparent",
          shadow: "transparent",
          text: COLORS.accent,
        };
    }
  };

  const colors = getColors();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.buttonOuter,
        { backgroundColor: colors.shadow },
        style,
      ]}
    >
      {({ pressed }: { pressed: boolean }) => {
        const isGhost = variant === "ghost";
        const pressTranslateY = isGhost ? 0 : (pressed ? 4 : 0);
        const depth = isGhost ? 0 : 4;
        
        return (
          <View
            style={[
              styles.buttonInner,
              {
                backgroundColor: colors.bg,
                transform: [{ translateY: pressTranslateY }],
                // Compensate the bottom height when pressed
                bottom: pressed ? 0 : depth,
                borderColor: colors.border || "transparent",
                borderWidth: colors.border ? 2 : 0,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: colors.text }
              ]}
            >
              {title}
            </Text>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonOuter: {
    height: 50,
    borderRadius: RADII.md,
    position: "relative",
    overflow: "visible",
  },
  buttonInner: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 46, // 50 height minus 4 depth
    borderRadius: RADII.md - 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    textTransform: "uppercase",
    textAlign: "center",
  },
});
