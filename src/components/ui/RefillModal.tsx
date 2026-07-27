import React, { useState } from "react";
import { StyleSheet, Text, View, Modal, Pressable, Alert } from "react-native";
import { useGame } from "../../context/GameContext";
import { COLORS, TYPOGRAPHY, RADII, SPACING } from "../../constants/theme";
import Mascot from "./Mascot";
import Button from "./Button";

interface RefillModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RefillModal({ visible, onClose }: RefillModalProps) {
  const {
    hearts,
    coins,
    buyHeartWithCoins,
    refillHeartsWithCoins,
  } = useGame();

  const [loading, setLoading] = useState(false);

  const handleBuyOne = async () => {
    setLoading(true);
    const result = await buyHeartWithCoins();
    setLoading(false);
    Alert.alert(result.success ? "सफलता! 🎉" : "ओह! ⚠️", result.message);
  };

  const handleRefillAll = async () => {
    setLoading(true);
    const result = await refillHeartsWithCoins();
    setLoading(false);
    Alert.alert(result.success ? "सफलता! 🎉" : "ओह! ⚠️", result.message);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContainer}>
          {/* Close button */}
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          <Mascot expression="happy" size={100} style={styles.mascot} />

          <Text style={styles.title}>दिल की दुकान (Hearts Shop)</Text>
          <Text style={styles.subtitle}>
            सिक्कों (Coins) का उपयोग करके अपने दिलों (Hearts) को रीफिल करें और सीखना जारी रखें!
          </Text>

          {/* Current Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statLabel}>आपके दिल:</Text>
              <Text style={styles.statValue}>{hearts} / 5</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🪙</Text>
              <Text style={styles.statLabel}>आपके सिक्के:</Text>
              <Text style={styles.statValue}>{coins}</Text>
            </View>
          </View>

          {/* Refill options */}
          <View style={styles.optionsContainer}>
            {/* Option 1: Buy 1 Heart */}
            <View style={styles.optionCard}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>+1 दिल (Heart)</Text>
                <Text style={styles.optionCost}>🪙 20 सिक्के</Text>
              </View>
              <Button
                title="खरीदें"
                variant="accent"
                disabled={hearts >= 5 || coins < 20 || loading}
                onPress={handleBuyOne}
                style={styles.optionButton}
              />
            </View>

            {/* Option 2: Full Refill */}
            <View style={styles.optionCard}>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>पूरा रीफिल (5 Hearts)</Text>
                <Text style={styles.optionCost}>🪙 100 सिक्के</Text>
              </View>
              <Button
                title="रीफिल"
                variant="primary"
                disabled={hearts >= 5 || coins < 100 || loading}
                onPress={handleRefillAll}
                style={styles.optionButton}
              />
            </View>
          </View>

          <Pressable onPress={onClose} style={styles.backLink}>
            <Text style={styles.backLinkText}>सीखना जारी रखें</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.borderDark,
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textMuted,
    fontWeight: "bold",
  },
  mascot: {
    marginBottom: 10,
  },
  title: {
    ...TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
    lineHeight: 18,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
    width: "100%",
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    padding: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  statLabel: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statValue: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
  },
  optionsContainer: {
    width: "100%",
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
  },
  optionCost: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  optionButton: {
    width: 80,
    height: 38,
  },
  backLink: {
    marginTop: 5,
  },
  backLinkText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.accent,
    textDecorationLine: "underline",
  },
});
