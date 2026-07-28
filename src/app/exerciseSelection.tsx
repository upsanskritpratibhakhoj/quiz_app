import React from "react";
import { StyleSheet, Text, View, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, RADII } from "../constants/theme";
import Mascot from "../components/ui/Mascot";
import TopStatsBar from "../components/ui/TopStatsBar";
import { buildLevelsForCategory } from "../utils/levelBuilder";
import { useGame } from "../context/GameContext";

export default function ExerciseSelectionScreen() {
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";
  const pathSelection = (params.pathSelection as string) || "beginner";

  const { completedLevels } = useGame();
  const levels = buildLevelsForCategory(category, pathSelection);

  // Helper to check if level is unlocked
  const isLevelUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLevel = levels[index - 1];
    const prevProgress = completedLevels[prevLevel.levelId];
    return !!(prevProgress && prevProgress.completed);
  };

  // Find the current active level (first unlocked level that is not completed)
  let activeIndex = 0;
  for (let i = 0; i < levels.length; i++) {
    const isCompleted = completedLevels[levels[i].levelId]?.completed;
    if (isLevelUnlocked(i) && !isCompleted) {
      activeIndex = i;
      break;
    }
    // If all unlocked are completed, active index will be the last unlocked level
    if (isLevelUnlocked(i)) {
      activeIndex = i;
    }
  }

  const handleSelectLevel = (levelId: string, levelIndex: number, isUnlocked: boolean, type: string) => {
    if (!isUnlocked) {
      return;
    }

    router.push({
      pathname: "/quiz",
      params: {
        category,
        pathSelection,
        levelId,
        levelIndex: (levelIndex + 1).toString(),
        questionType: type,
      },
    });
  };

  // 3-step offset to create a winding curved path (zig-zag S-curve)
  const getXOffset = (idx: number) => {
    const step = idx % 4;
    if (step === 1) return 45; // Winding Right
    if (step === 3) return -45; // Winding Left
    return 0; // Center
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopStatsBar title={category} onBack={() => router.back()} />

      <View style={styles.container}>
        {levels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Mascot expression="guiding" size={100} style={styles.emptyMascot} />
            <Text style={styles.emptyText}>
              इस श्रेणी में कोई अभ्यास उपलब्ध नहीं है। कृपया कोई अन्य श्रेणी चुनें।
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Winding dotted path background line */}
            <View style={styles.pathLine} />

            <Text style={styles.pathHeader}>ज्ञान पथ (Sanskrit Path)</Text>
            <Text style={styles.pathSubheader}>सभी स्तरों को पूरा करके अगला पाठ अनलॉक करें!</Text>

            {levels.map((level, index) => {
              const unlocked = isLevelUnlocked(index);
              const progress = completedLevels[level.levelId];
              const completed = !!(progress && progress.completed);
              const score = progress?.score || 0;
              const isActive = index === activeIndex;

              const xOffset = getXOffset(index);
              const isRightSide = xOffset > 0;

              return (
                <View
                  key={level.levelId}
                  style={[
                    styles.levelRow,
                    { transform: [{ translateX: xOffset }] }
                  ]}
                >
                  {/* Circular Level Button */}
                  <Pressable
                    onPress={() => handleSelectLevel(level.levelId, index, unlocked, level.type)}
                    style={({ pressed }) => [
                      styles.levelButton,
                      unlocked
                        ? completed
                          ? styles.levelCompleted
                          : styles.levelUnlocked
                        : styles.levelLocked,
                      pressed && unlocked && { transform: [{ translateY: 2 }], borderBottomWidth: 2 }
                    ]}
                  >
                    <Text style={[styles.levelIconText, !unlocked && styles.levelIconLocked]}>
                      {unlocked ? (completed ? "👑" : level.icon) : "🔒"}
                    </Text>
                  </Pressable>

                  {/* Level Info Badge below or side */}
                  <View style={styles.badgeContainer}>
                    <Text style={styles.levelNumberText}>स्तर {index + 1}</Text>
                    <Text style={styles.levelTitleText} numberOfLines={1}>
                      {level.title}
                    </Text>
                    {completed && (
                      <Text style={styles.scoreText}>अंक: {score}%</Text>
                    )}
                  </View>

                  {/* Floating Mascot pointing to the active level */}
                  {isActive && unlocked && (
                    <View
                      style={[
                        styles.mascotBubbleContainer,
                        isRightSide ? styles.mascotLeft : styles.mascotRight
                      ]}
                    >
                      <Mascot expression="guiding" size={54} style={styles.mascotFloating} />
                      <View style={styles.bubble}>
                        <Text style={styles.bubbleText}>चलो शुरू करें! 👉</Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, // Pale sky-blue background
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 30,
    alignItems: "center",
    paddingBottom: 60,
  },
  pathLine: {
    position: "absolute",
    top: 90,
    bottom: 50,
    width: 6,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 3,
    zIndex: -1,
  },
  pathHeader: {
    ...TYPOGRAPHY.display,
    color: COLORS.text,
    fontSize: 20,
    textAlign: "center",
    marginBottom: 4,
  },
  pathSubheader: {
    ...TYPOGRAPHY.bodyRegular,
    color: COLORS.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 40,
  },
  levelRow: {
    marginVertical: 20,
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  levelButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  levelUnlocked: {
    backgroundColor: COLORS.accent,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.accentDark,
  },
  levelCompleted: {
    backgroundColor: COLORS.primary,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.primaryDark,
  },
  levelLocked: {
    backgroundColor: COLORS.whiteDark,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.borderDark,
  },
  levelIconText: {
    fontSize: 28,
  },
  levelIconLocked: {
    opacity: 0.5,
  },
  badgeContainer: {
    marginTop: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    alignItems: "center",
    maxWidth: 160,
    elevation: 2,
  },
  levelNumberText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.textMuted,
    textTransform: "uppercase",
  },
  levelTitleText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text,
    marginTop: 1,
  },
  scoreText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.primaryDark,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyMascot: {
    marginBottom: 20,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  mascotBubbleContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    top: 6,
    zIndex: 10,
    gap: 8,
  },
  mascotLeft: {
    left: -130,
  },
  mascotRight: {
    right: -130,
    flexDirection: "row-reverse",
  },
  mascotFloating: {
    transform: [{ translateY: -5 }],
  },
  bubble: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    borderRadius: RADII.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  bubbleText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text,
  },
});
