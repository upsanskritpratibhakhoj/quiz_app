import React, { useState } from "react";
import { StyleSheet, Text, View, Pressable, ViewStyle } from "react-native";
import { useGame } from "../../context/GameContext";
import { COLORS, TYPOGRAPHY, RADII } from "../../constants/theme";
import RefillModal from "./RefillModal";

interface TopStatsBarProps {
  title?: string;
  onBack?: () => void;
  style?: ViewStyle;
}

export default function TopStatsBar({ title, onBack, style }: TopStatsBarProps) {
  const { exp, coins, hearts } = useGame();
  const [shopVisible, setShopVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {/* Left section: Title or Back button */}
      <View style={styles.leftSection}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        ) : title ? (
          <Text style={styles.barTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ width: 10 }} />
        )}
      </View>

      {/* Right section: Stats */}
      <View style={styles.statsContainer}>
        {/* EXP Stat */}
        <View style={styles.statItem}>
          <Text style={[styles.statIcon, { color: COLORS.warning }]}>⚡</Text>
          <Text style={styles.statText}>{exp}</Text>
        </View>

        {/* Coins Stat */}
        <Pressable onPress={() => setShopVisible(true)} style={styles.statItem}>
          <Text style={styles.statIcon}>🪙</Text>
          <Text style={styles.statText}>{coins}</Text>
        </Pressable>

        {/* Hearts Stat */}
        <Pressable onPress={() => setShopVisible(true)} style={styles.statItem}>
          <Text style={[styles.statIcon, { color: COLORS.error }]}>❤️</Text>
          <Text style={styles.statText}>{hearts === 5 ? "FULL" : hearts}</Text>
        </Pressable>
      </View>

      {/* Hearts/Refill shop modal */}
      <RefillModal visible={shopVisible} onClose={() => setShopVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  leftSection: {
    flex: 1,
    justifyContent: "center",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.whiteDark,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.accent,
  },
  barTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.whiteDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    minWidth: 56,
    justifyContent: "center",
  },
  statIcon: {
    fontSize: 15,
    marginRight: 4,
  },
  statText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text,
  },
});
