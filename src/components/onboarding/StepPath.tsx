import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../../constants/theme";
import Card from "../ui/Card";
import Button from "../ui/Button";
import { useGame } from "../../context/GameContext";

interface StepPathProps {
  selectedPath: "beginner" | "placement" | "";
  onSelectPath: (path: "beginner" | "placement") => void;
  onNext: () => void;
}

function PathIcon({ type }: { type: "beginner" | "placement" }) {
  if (type === "beginner") {
    // Draw a sprout (seedling) growing
    return (
      <View style={styles.iconContainer}>
        {/* Soil base */}
        <View style={styles.soil} />
        {/* Sprout stem */}
        <View style={styles.sproutStem} />
        {/* Leaves */}
        <View style={styles.leafLeft} />
        <View style={styles.leafRight} />
      </View>
    );
  } else {
    // Draw a test sheet with score
    return (
      <View style={styles.iconContainer}>
        {/* Test paper base */}
        <View style={styles.paperBase}>
          {/* Text lines */}
          <View style={styles.paperLine} />
          <View style={[styles.paperLine, { width: "70%" }]} />
          <View style={[styles.paperLine, { width: "50%" }]} />
        </View>
        {/* Checkmark mark */}
        <View style={styles.badgeCheck}>
          <Text style={styles.badgeText}>✓</Text>
        </View>
      </View>
    );
  }
}

export default function StepPath({
  selectedPath,
  onSelectPath,
  onNext,
}: StepPathProps) {
  const { isDevMode, setDevMode } = useGame();
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreditsPress = () => {
    const now = Date.now();
    const nextCount = now - lastTapTime < 2500 ? tapCount + 1 : 1;
    setLastTapTime(now);
    setTapCount(nextCount);

    if (nextCount >= 5) {
      setTapCount(0);
      if (isDevMode) {
        setDevMode(false);
        Alert.alert(
          "God Mode Deactivated 🔒",
          "Standard game rules and level locks have been restored."
        );
      } else {
        setPasswordInput("");
        setErrorMessage("");
        setPasswordModalVisible(true);
      }
    }
  };

  const handleUnlockSubmit = () => {
    if (passwordInput.trim() === "0000") {
      setDevMode(true);
      setPasswordModalVisible(false);
      setPasswordInput("");
      setErrorMessage("");
      Alert.alert(
        "God Mode Activated! 🚀",
        "All quizzes and levels are now unlocked. All restrictions (75% score rule, hearts) are bypassed!"
      );
    } else {
      setErrorMessage("गलत पासवर्ड! (Incorrect password. Master PIN is 0000)");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Where would you like to start?</Text>

      <View style={styles.list}>
        {/* Beginner Path */}
        <Card
          selected={selectedPath === "beginner"}
          onPress={() => onSelectPath("beginner")}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <PathIcon type="beginner" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.pathTitle}>बाल वर्ग</Text>
              <Text style={styles.pathSubtitle}>
                First time learning Sanskrit? Start with the absolute basics!
              </Text>
            </View>
          </View>
        </Card>

        {/* Placement Path */}
        <Card
          selected={selectedPath === "placement"}
          onPress={() => onSelectPath("placement")}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <PathIcon type="placement" />
            <View style={styles.cardTextContainer}>
              <Text style={styles.pathTitle}>युवा वर्ग</Text>
              <Text style={styles.pathSubtitle}>
                Already know some Sanskrit?
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.footer}>
        <Pressable onPress={handleCreditsPress} hitSlop={10}>
          <Text style={styles.creditsText}>
            Developed by Jagdanand Jha and Jayesh Krishna
            {isDevMode && " (🔓 God Mode ON)"}
          </Text>
        </Pressable>
        <Button
          title="Start Learning"
          variant="primary"
          onPress={onNext}
          disabled={!selectedPath}
        />
      </View>

      {/* Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Text style={styles.modalIcon}>🔐</Text>
            </View>
            <Text style={styles.modalTitle}>डेवलपर मोड (God Mode)</Text>
            <Text style={styles.modalSubtitle}>
              Enter master password to unlock all levels & bypass all restrictions.
            </Text>

            <TextInput
              style={styles.pinInput}
              value={passwordInput}
              onChangeText={(text) => {
                setPasswordInput(text);
                setErrorMessage("");
              }}
              placeholder="••••"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              secureTextEntry
              autoFocus
              textAlign="center"
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <View style={styles.modalButtonsRow}>
              <Pressable
                onPress={() => setPasswordModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>रद्द करें (Cancel)</Text>
              </Pressable>
              <View style={{ flex: 1 }}>
                <Button
                  title="Unlock 🚀"
                  variant="primary"
                  onPress={handleUnlockSubmit}
                  disabled={passwordInput.length === 0}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.text,
    textAlign: "center",
    marginVertical: 25,
  },
  list: {
    gap: 20,
    flex: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  card: {
    height: 120,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 15,
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  pathTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  pathSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  soil: {
    position: "absolute",
    bottom: 8,
    width: 28,
    height: 6,
    backgroundColor: "#b88a5c",
    borderRadius: 3,
  },
  sproutStem: {
    position: "absolute",
    bottom: 12,
    width: 4,
    height: 20,
    backgroundColor: "#58cc02",
    borderRadius: 2,
  },
  leafLeft: {
    position: "absolute",
    top: 18,
    left: 12,
    width: 12,
    height: 6,
    backgroundColor: "#58cc02",
    borderTopLeftRadius: 6,
    borderBottomRightRadius: 6,
    transform: [{ rotate: "-25deg" }],
  },
  leafRight: {
    position: "absolute",
    top: 16,
    right: 12,
    width: 12,
    height: 6,
    backgroundColor: "#78ca28",
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 6,
    transform: [{ rotate: "25deg" }],
  },
  paperBase: {
    width: 24,
    height: 32,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 3,
    padding: 3,
    gap: 3,
  },
  paperLine: {
    height: 2,
    backgroundColor: COLORS.backgroundDark,
    width: "100%",
    borderRadius: 1,
  },
  badgeCheck: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: COLORS.onPrimary,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
  creditsText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 24,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.backgroundDark,
    elevation: 10,
  },
  modalIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 26,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  pinInput: {
    width: "100%",
    height: 52,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADII.md,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
    letterSpacing: 10,
    marginBottom: 8,
  },
  errorText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.error,
    textAlign: "center",
    marginBottom: 12,
  },
  modalButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
    width: "100%",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.borderDark,
    backgroundColor: COLORS.whiteDark,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
