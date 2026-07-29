import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, RADII } from "../constants/theme";
import TopStatsBar from "../components/ui/TopStatsBar";
import Button from "../components/ui/Button";
import { buildLevelsForCategory, Level } from "../utils/levelBuilder";
import { useGame } from "../context/GameContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Serpentine X-Offsets for a smooth S-curve learning map path
const S_CURVE_OFFSETS = [0, 60, 105, 60, 0, -60, -105, -60];

// Dynamic Chapter Title generator based on level index
const CHAPTER_TITLES = [
  "अध्याय 1: प्रारम्भिक अभ्यास (Foundations)",
  "अध्याय 2: मध्यम स्तर (Intermediate Skills)",
  "अध्याय 3: उन्नत प्रयोग (Advanced Mastery)",
  "अध्याय 4: विद्वान स्तर (Expert Level)",
];

export default function ExerciseSelectionScreen() {
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";
  const pathSelection = (params.pathSelection as string) || "beginner";

  const { completedLevels } = useGame();
  const levels = useMemo(
    () => buildLevelsForCategory(category, pathSelection),
    [category, pathSelection]
  );

  const [selectedLevelModal, setSelectedLevelModal] = useState<{
    level: Level;
    index: number;
    unlocked: boolean;
    completed: boolean;
    score: number;
    stars: number;
  } | null>(null);

  // Helper to check if level is unlocked
  const isLevelUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLevel = levels[index - 1];
    const prevProgress = completedLevels[prevLevel.levelId];
    return !!(prevProgress && prevProgress.completed);
  };

  // Find active level index
  const activeIndex = useMemo(() => {
    let active = 0;
    for (let i = 0; i < levels.length; i++) {
      const isCompleted = completedLevels[levels[i].levelId]?.completed;
      if (isLevelUnlocked(i) && !isCompleted) {
        return i;
      }
      if (isLevelUnlocked(i)) {
        active = i;
      }
    }
    return active;
  }, [levels, completedLevels]);

  // Calculate total stars collected
  const totalStars = useMemo(() => {
    let count = 0;
    levels.forEach((lvl) => {
      const prog = completedLevels[lvl.levelId];
      if (prog && prog.completed) {
        if (prog.score >= 90) count += 3;
        else if (prog.score >= 75) count += 2;
        else count += 1;
      }
    });
    return count;
  }, [levels, completedLevels]);

  const completedCount = useMemo(() => {
    return levels.filter((lvl) => completedLevels[lvl.levelId]?.completed).length;
  }, [levels, completedLevels]);

  const progressPercent = levels.length > 0 ? (completedCount / levels.length) * 100 : 0;

  const getXOffset = (index: number) => {
    return S_CURVE_OFFSETS[index % S_CURVE_OFFSETS.length];
  };

  const getStarsForScore = (score: number, completed: boolean) => {
    if (!completed) return 0;
    if (score >= 90) return 3;
    if (score >= 75) return 2;
    return 1;
  };

  const handleNodePress = (
    level: Level,
    index: number,
    unlocked: boolean,
    completed: boolean,
    score: number
  ) => {
    if (!unlocked) return;
    const stars = getStarsForScore(score, completed);
    setSelectedLevelModal({
      level,
      index,
      unlocked,
      completed,
      score,
      stars,
    });
  };

  const handleStartLevel = () => {
    if (!selectedLevelModal) return;
    const { level, index } = selectedLevelModal;
    setSelectedLevelModal(null);

    router.push({
      pathname: "/quiz",
      params: {
        category,
        pathSelection,
        levelId: level.levelId,
        levelIndex: (index + 1).toString(),
        questionType: level.type,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Gamified Top Bar */}
      <TopStatsBar title={category || "अभ्यास मार्ग"} onBack={() => router.back()} />

      <View style={styles.container}>
        {/* Sky Background Decorative Elements */}
        <View style={styles.cloudLeft} />
        <View style={styles.cloudRight} />

        {levels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyTitle}>कोई पाठ उपलब्ध नहीं है</Text>
            <Text style={styles.emptyText}>
              इस श्रेणी में अभ्यास उपलब्ध नहीं है। कृपया कोई अन्य श्रेणी चुनें।
            </Text>
            <View style={{ marginTop: 20 }}>
              <Button title="श्रेणियां देखें" variant="primary" onPress={() => router.back()} />
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Header Card */}
            <View style={styles.headerCard}>
              <View style={styles.headerCardTop}>
                <View style={styles.headerIconBox}>
                  <Text style={styles.headerIconText}>🎯</Text>
                </View>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.headerCategoryTitle} numberOfLines={1}>
                    {category}
                  </Text>
                  <Text style={styles.headerSubtext}>
                    {pathSelection === "beginner" ? "बाल वर्ग" : "युवा वर्ग"} • पूर्ण: {completedCount}/{levels.length}
                  </Text>
                </View>
                <View style={styles.starsPill}>
                  <Text style={styles.starsPillIcon}>⭐</Text>
                  <Text style={styles.starsPillText}>{totalStars}</Text>
                </View>
              </View>

              {/* Progress Bar inside Header */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, Math.max(6, progressPercent))}%` },
                  ]}
                />
              </View>
            </View>

            {/* Serpentine Level Path */}
            <View style={styles.pathWrapper}>
              {levels.map((level, index) => {
                const unlocked = isLevelUnlocked(index);
                const progress = completedLevels[level.levelId];
                const completed = !!(progress && progress.completed);
                const score = progress?.score || 0;
                const stars = getStarsForScore(score, completed);
                const isActive = index === activeIndex;

                const currX = getXOffset(index);
                const nextX = index < levels.length - 1 ? getXOffset(index + 1) : currX;

                // Check if this level is a milestone boss level (every 4th level)
                const isMilestone = (index + 1) % 4 === 0 || index === levels.length - 1;

                // Render Chapter Header Banner every 4 levels
                const showChapterHeader = index % 4 === 0;
                const chapterIndex = Math.floor(index / 4);
                const chapterTitle =
                  CHAPTER_TITLES[chapterIndex] || `अध्याय ${chapterIndex + 1}: अभ्यास पथ`;

                return (
                  <React.Fragment key={level.levelId}>
                    {/* Chapter Section Banner */}
                    {showChapterHeader && (
                      <View style={styles.chapterBanner}>
                        <View style={styles.chapterBannerPill}>
                          <Text style={styles.chapterFlagIcon}>🚩</Text>
                          <Text style={styles.chapterBannerText}>{chapterTitle}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.nodeRow}>
                      {/* Visual Curved Path Connector */}
                      {index < levels.length - 1 && (
                        <View
                          style={[
                            styles.pathConnector,
                            {
                              left: SCREEN_WIDTH / 2 + currX - 6,
                              width: Math.abs(nextX - currX) + 14,
                              transform: [
                                {
                                  rotate:
                                    nextX > currX
                                      ? "32deg"
                                      : nextX < currX
                                      ? "-32deg"
                                      : "0deg",
                                },
                              ],
                            },
                          ]}
                        >
                          <View style={styles.connectorInnerDash} />
                        </View>
                      )}

                      {/* Level Node Container */}
                      <View
                        style={[
                          styles.nodeContainer,
                          { transform: [{ translateX: currX }] },
                        ]}
                      >
                        {/* Active Level Pulsing Halo */}
                        {isActive && unlocked && <View style={styles.activePulsingRing} />}

                        {/* Level Button Node */}
                        <Pressable
                          onPress={() =>
                            handleNodePress(level, index, unlocked, completed, score)
                          }
                          style={({ pressed }) => [
                            styles.nodeCircle,
                            isMilestone && styles.milestoneNode,
                            unlocked
                              ? completed
                                ? styles.nodeCompleted
                                : isActive
                                ? styles.nodeActive
                                : styles.nodeUnlocked
                              : styles.nodeLocked,
                            pressed && unlocked && styles.nodePressed,
                          ]}
                        >
                          {/* 3D Gloss Highlight */}
                          <View style={styles.nodeGloss} />

                          {/* Level Icon / Number */}
                          <Text
                            style={[
                              styles.nodeIconText,
                              isMilestone && styles.milestoneIconText,
                            ]}
                          >
                            {!unlocked
                              ? "🔒"
                              : completed
                              ? isMilestone
                                ? "🏆"
                                : "👑"
                              : level.icon || `${index + 1}`}
                          </Text>

                          {/* Level Number Badge */}
                          <View style={styles.levelNumBadge}>
                            <Text style={styles.levelNumText}>
                              {isMilestone ? `★ ${index + 1}` : index + 1}
                            </Text>
                          </View>
                        </Pressable>

                        {/* Active Level START Tag */}
                        {isActive && unlocked && (
                          <View style={styles.activeStartBadge}>
                            <Text style={styles.activeStartText}>शुरू करें ▶</Text>
                          </View>
                        )}

                        {/* Star Rating Badge (Completed Nodes) */}
                        {completed ? (
                          <View style={styles.starsRow}>
                            <Text style={styles.starIcon}>{stars >= 1 ? "⭐" : "☆"}</Text>
                            <Text style={[styles.starIcon, styles.starCenter]}>
                              {stars >= 2 ? "⭐" : "☆"}
                            </Text>
                            <Text style={starIconStyle(stars >= 3)}>
                              {stars >= 3 ? "⭐" : "☆"}
                            </Text>
                          </View>
                        ) : (
                          !isActive && (
                            <View style={styles.nodeTitlePill}>
                              <Text style={styles.nodeTitleText} numberOfLines={1}>
                                {level.type.replace("_", " ")}
                              </Text>
                            </View>
                          )
                        )}
                      </View>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Interactive Level Selection Modal Card */}
        <Modal
          visible={!!selectedLevelModal}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedLevelModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Top Modal Header */}
              <View style={styles.modalHeaderBox}>
                <View style={styles.modalIconCircle}>
                  <Text style={styles.modalHeaderIcon}>
                    {selectedLevelModal?.completed
                      ? "👑"
                      : selectedLevelModal?.level.icon || "🎯"}
                  </Text>
                </View>
                <View style={styles.modalHeaderBadge}>
                  <Text style={styles.modalHeaderBadgeText}>
                    स्तर {selectedLevelModal ? selectedLevelModal.index + 1 : 1}
                  </Text>
                </View>
              </View>

              {/* Level Titles */}
              <Text style={styles.modalTitle}>{selectedLevelModal?.level.title}</Text>
              <Text style={styles.modalDesc}>{selectedLevelModal?.level.desc}</Text>

              {/* Reward & Progress Stats */}
              {selectedLevelModal?.completed ? (
                <View style={styles.modalStatsBox}>
                  <Text style={styles.modalScoreLabel}>सर्वश्रेष्ठ अंक (Best Score)</Text>
                  <Text style={styles.modalScoreValue}>{selectedLevelModal.score}%</Text>
                  <View style={styles.modalStarsRow}>
                    <Text style={styles.modalStarText}>
                      {"⭐".repeat(selectedLevelModal.stars) +
                        "☆".repeat(3 - selectedLevelModal.stars)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.modalRewardBox}>
                  <View style={styles.rewardTag}>
                    <Text style={styles.rewardIcon}>⚡</Text>
                    <Text style={styles.rewardText}>+50 EXP</Text>
                  </View>
                  <View style={styles.rewardTag}>
                    <Text style={styles.rewardIcon}>🪙</Text>
                    <Text style={styles.rewardText}>+20 Coins</Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <Button
                  title="शुरू करें (Play Lesson)"
                  variant="primary"
                  onPress={handleStartLevel}
                />
                <Pressable
                  onPress={() => setSelectedLevelModal(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>बंद करें (Close)</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

function starIconStyle(active: boolean) {
  return [styles.starIcon, active ? null : { opacity: 0.35 }];
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, // Sky blue base theme
  },
  container: {
    flex: 1,
    position: "relative",
  },
  cloudLeft: {
    position: "absolute",
    top: 20,
    left: -40,
    width: 140,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ffffff",
    opacity: 0.4,
    zIndex: -1,
  },
  cloudRight: {
    position: "absolute",
    top: 140,
    right: -30,
    width: 160,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ffffff",
    opacity: 0.45,
    zIndex: -1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: "center",
  },

  /* Header Card */
  headerCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md + 4,
    padding: 14,
    borderWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.borderDark,
    marginBottom: 24,
    elevation: 4,
  },
  headerCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e8f7ff",
    borderWidth: 2,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerIconText: {
    fontSize: 22,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerCategoryTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: COLORS.text,
  },
  headerSubtext: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  starsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff8d6",
    borderWidth: 2,
    borderColor: COLORS.warningDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.md,
    gap: 4,
  },
  starsPillIcon: {
    fontSize: 14,
  },
  starsPillText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.warningDark,
  },
  progressTrack: {
    height: 12,
    backgroundColor: COLORS.whiteDark,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: COLORS.borderDark,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },

  /* Chapter Section Header Banner */
  chapterBanner: {
    width: "100%",
    alignItems: "center",
    marginVertical: 14,
  },
  chapterBannerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1cb0f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: "#ffffff",
    borderBottomWidth: 5,
    borderBottomColor: "#1486bd",
    gap: 6,
    elevation: 3,
  },
  chapterFlagIcon: {
    fontSize: 14,
  },
  chapterBannerText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: "#ffffff",
    fontWeight: "700",
  },

  /* Winding Path */
  pathWrapper: {
    width: "100%",
    alignItems: "center",
  },
  nodeRow: {
    marginVertical: 20,
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  pathConnector: {
    position: "absolute",
    top: 60,
    height: 44,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 6,
    zIndex: -1,
    borderWidth: 1.5,
    borderColor: "#90cceb",
  },
  connectorInnerDash: {
    width: "100%",
    height: "100%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 6,
  },

  /* Node Styling */
  nodeContainer: {
    alignItems: "center",
    position: "relative",
  },
  activePulsingRing: {
    position: "absolute",
    top: -8,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(28, 176, 246, 0.25)",
    borderWidth: 3,
    borderColor: COLORS.accent,
    zIndex: -1,
  },
  nodeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    position: "relative",
  },
  milestoneNode: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  nodeCompleted: {
    backgroundColor: COLORS.primary,
    borderWidth: 4,
    borderColor: "#ffffff",
    borderBottomWidth: 8,
    borderBottomColor: COLORS.primaryDark,
  },
  nodeActive: {
    backgroundColor: COLORS.accent,
    borderWidth: 4,
    borderColor: "#ffffff",
    borderBottomWidth: 8,
    borderBottomColor: COLORS.accentDark,
  },
  nodeUnlocked: {
    backgroundColor: "#ffc800",
    borderWidth: 4,
    borderColor: "#ffffff",
    borderBottomWidth: 8,
    borderBottomColor: "#e6a100",
  },
  nodeLocked: {
    backgroundColor: COLORS.whiteDark,
    borderWidth: 4,
    borderColor: "#ffffff",
    borderBottomWidth: 8,
    borderBottomColor: COLORS.borderDark,
  },
  nodePressed: {
    transform: [{ translateY: 4 }],
    borderBottomWidth: 4,
  },
  nodeGloss: {
    position: "absolute",
    top: 6,
    left: 12,
    width: 32,
    height: 16,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    transform: [{ rotate: "-20deg" }],
  },
  nodeIconText: {
    fontSize: 32,
  },
  milestoneIconText: {
    fontSize: 38,
  },
  levelNumBadge: {
    position: "absolute",
    bottom: -6,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    elevation: 2,
  },
  levelNumText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.text,
  },

  activeStartBadge: {
    marginTop: 8,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.accentDark,
    elevation: 3,
  },
  activeStartText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "700",
  },

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
  },
  starIcon: {
    fontSize: 13,
  },
  starCenter: {
    fontSize: 16,
    transform: [{ translateY: -2 }],
  },
  nodeTitlePill: {
    marginTop: 10,
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
    maxWidth: 130,
  },
  nodeTitleText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.text,
  },

  /* Empty State */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 10,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },

  /* Modal Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 22,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.backgroundDark,
    elevation: 12,
  },
  modalHeaderBox: {
    alignItems: "center",
    marginBottom: 14,
  },
  modalIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#e8f7ff",
    borderWidth: 3,
    borderColor: COLORS.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderIcon: {
    fontSize: 36,
  },
  modalHeaderBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: -10,
  },
  modalHeaderBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.white,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  modalDesc: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 16,
  },
  modalStatsBox: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADII.md,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
  },
  modalScoreLabel: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalScoreValue: {
    ...TYPOGRAPHY.heading,
    fontSize: 22,
    color: COLORS.primaryDark,
    marginVertical: 2,
  },
  modalStarsRow: {
    marginTop: 2,
  },
  modalStarText: {
    fontSize: 20,
  },
  modalRewardBox: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    marginBottom: 18,
  },
  rewardTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff9e6",
    borderWidth: 1.5,
    borderColor: COLORS.warningDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.md,
    gap: 6,
  },
  rewardIcon: {
    fontSize: 16,
  },
  rewardText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text,
  },
  modalActions: {
    width: "100%",
    gap: 10,
  },
  modalCloseBtn: {
    paddingVertical: 8,
    alignItems: "center",
  },
  modalCloseText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
});
