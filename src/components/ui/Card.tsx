import React from "react";
import { StyleSheet, Pressable, View, ViewStyle } from "react-native";
import { COLORS, RADII } from "../../constants/theme";

interface CardProps {
  selected: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "accent";
}

export default function Card({
  selected,
  onPress,
  children,
  style,
  variant = "accent",
}: CardProps) {
  const activeColor = variant === "primary" ? COLORS.primary : COLORS.accent;
  const activeShadow = variant === "primary" ? COLORS.primaryDark : COLORS.accentDark;
  
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.cardOuter,
        {
          backgroundColor: selected ? activeShadow : COLORS.borderDark,
        },
        style,
      ]}
    >
      {({ pressed }: { pressed: boolean }) => {
        const pressTranslateY = pressed && onPress ? 3 : 0;
        const depth = 4;
        
        return (
          <View
            style={[
              styles.cardInner,
              {
                backgroundColor: selected
                  ? (variant === "primary" ? "#f5ffd6" : "#e6f7ff")
                  : COLORS.white,
                borderColor: selected ? activeColor : COLORS.border,
                transform: [{ translateY: pressTranslateY }],
                bottom: pressed && onPress ? 0 : depth,
              },
            ]}
          >
            {children}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: RADII.md,
    position: "relative",
    overflow: "visible",
    minHeight: 60,
  },
  cardInner: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 4,
    borderRadius: RADII.md - 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 12,
    justifyContent: "center",
  },
});
