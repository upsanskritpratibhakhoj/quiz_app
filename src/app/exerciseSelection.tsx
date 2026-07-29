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
import Mascot from "../components/ui/Mascot";
import TopStatsBar from "../components/ui/TopStatsBar";
import Button from "../components/ui/Button";
import { buildLevelsForCategory, Level } from "../utils/levelBuilder";
import { useGame } from "../context/GameContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Serpentine X-Offsets to create a smooth winding Candy Crush / Duolingo curve
const S_CURVE_OFFSETS = [0, 65, 110, 65, 0, -65, -110, -65];

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

  const [activeTab, setActiveTab] = useState<"map" | "events" | "shop">("map");

  // Helper to check if level is unlocked
  const isLevelUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLevel = levels[index - 1];
    const prevProgress = completedLevels[prevLevel.levelId];
    return !!(prevProgress && prevProgress.completed);
  };

  // Find current active level (first unlocked level that is not completed)
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

  // Calculate total stars collected across levels
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
    const { level, index, unlocked } = selectedLevelModal;
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
      {/* Gamified Top Stats Bar */}
      <TopStatsBar title={category || "अभ्यास मार्ग"} onBack={() => router.back()} />

      <View style={styles.container}>
        {/* Background Candy Hills Accent Elements */}
        <View style={styles.bgHillTopLeft} />
        <View style={styles.bgHillTopRight} />

        {levels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Mascot expression="guiding" size={110} style={styles.emptyMascot} />
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
            {/* Top Category Map Banner (Bubblegum Hill Style) */}
            <View style={styles.headerCard}>
              <View style={styles.headerCardTop}>
                <View style={styles.headerBadgeIcon}>
                  <Text style={styles.headerBadgeText}>👑</Text>
                </View>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.headerCategoryTitle} numberOfLines={1}>
                    {category}
                  </Text>
                  <Text style={styles.headerSubtext}>
                    {pathSelection === "beginner" ? "बाल वर्ग" : "युवा वर्ग"} • स्तर {completedCount}/{levels.length}
                  </Text>
                </View>
                <View style={styles.starsPill}>
                  <Text style={styles.starsPillIcon}>⭐</Text>
                  <Text style={styles.starsPillText}>{totalStars}</Text>
                </View>
              </View>

              {/* Progress Bar inside Header */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(8, progressPercent))}%` }]} />
              </View>
            </View>

            {/* Victory Finish Arch Banner at Top of Winding Path */}
            <View style={styles.finishArchContainer}>
              <View style={styles.finishArchPill}>
                <Text style={styles.finishArchFlag}>🏁</Text>
                <Text style={styles.finishArchText}>ज्ञान विजय द्वार (Finish)</Text>
                <Text style={styles.finishArchFlag}>🏁</Text>
              </View>
            </View>

            {/* Path Winding Container */}
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
                const isRightSide = currX > 0;

                return (
                  <View key={level.levelId} style={styles.nodeRow}>
                    {/* Visual Path Connector to next node */}
                    {index < levels.length - 1 && (
                      <View
                        style={[
                          styles.pathConnector,
                          {
                            left: SCREEN_WIDTH / 2 + currX - 6,
                            width: Math.abs(nextX - currX) + 12,
                            transform: [
                              {
                                rotate:
                                  nextX > currX
                                    ? "35deg"
                                    : nextX < currX
                                    ? "-35deg"
                                    : "0deg",
                              },
                            ],
                          },
                        ]}
                      >
                        {/* Dotted inner line */}
                        <View style={styles.connectorDots} />
                      </View>
                    )}

                    {/* Level Node Button */}
                    <View
                      style={[
                        styles.nodeContainer,
                        { transform: [{ translateX: currX }] },
                      ]}
                    >
                      {/* Active Level Glowing Halo Ring */}
                      {isActive && unlocked && <View style={styles.activeGlowRing} />}

                      <Pressable
                        onPress={() =>
                          handleNodePress(level, index, unlocked, completed, score)
                        }
                        style={({ pressed }) => [
                          styles.nodeCircle,
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
                        {/* Glossy Top Reflection */}
                        <View style={styles.nodeGloss} />

                        {/* Node Icon / Number */}
                        <Text style={styles.nodeIconText}>
                          {!unlocked
                            ? "🔒"
                            : completed
                            ? "👑"
                            : level.icon || `${index + 1}`}
                        </Text>

                        {/* Level Number Badge Overlay */}
                        <View style={styles.levelNumBadge}>
                          <Text style={styles.levelNumText}>{index + 1}</Text>
                        </View>
                      </Pressable>

                      {/* Star Rating Badge beneath completed node */}
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
                        <View style={styles.nodeTitlePill}>
                          <Text style={styles.nodeTitleText} numberOfLines={1}>
                            {level.type.replace("_", " ")}
                          </Text>
                        </View>
                      )}

                      {/* Floating Active Level Mascot Callout */}
                      {isActive && unlocked && (
                        <View
                          style={[
                            styles.mascotCallout,
                            isRightSide ? styles.mascotLeft : styles.mascotRight,
                          ]}
                        >
                          <Mascot expression="guiding" size={56} />
                          <View style={styles.speechBubble}>
                            <View style={styles.bubbleArrow} />
                            <Text style={styles.speechText}>चलो शुरू करें! 👉</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}

        {/* Gamified Bottom Dock Navigation Bar (Matching Screenshot Reference) */}
        <View style={styles.bottomDock}>
          <Pressable
            style={[styles.dockItem, activeTab === "map" && styles.dockItemActive]}
            onPress={() => setActiveTab("map")}
          >
            <Text style={styles.dockIcon}>🗺️</Text>
            <Text style={[styles.dockLabel, activeTab === "map" && styles.dockLabelActive]}>
              MAP
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dockItem, activeTab === "events" && styles.dockItemActive]}
            onPress={() => setActiveTab("events")}
          >
            <View style={styles.dockBadge}>
              <Text style={styles.dockBadgeText}>NEW</Text>
            </View>
            <Text style={styles.dockIcon}>🏆</Text>
            <Text style={[styles.dockLabel, activeTab === "events" && styles.dockLabelActive]}>
              EVENTS
            </Text>
          </Pressable>

          <Pressable
            style={[styles.dockItem, activeTab === "shop" && styles.dockItemActive]}
            onPress={() => setActiveTab("shop")}
          >
            <Text style={styles.dockIcon}>🛍️</Text>
            <Text style={[styles.dockLabel, activeTab === "shop" && styles.dockLabelActive]}>
              SHOP
            </Text>
          </Pressable>
        </View>

        {/* Interactive Level Selection Modal */}
        <Modal
          visible={!!selectedLevelModal}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedLevelModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {/* Top Decorative Header */}
              <View style={styles.modalHeaderBg}>
                <Text style={styles.modalHeaderIcon}>
                  {selectedLevelModal?.completed
                    ? "👑"
                    : selectedLevelModal?.level.icon || "🎯"}
                </Text>
                <Text style={styles.modalHeaderBadge}>
                  स्तर {selectedLevelModal ? selectedLevelModal.index + 1 : 1}
                </Text>
              </View>

              {/* Level Details */}
              <Text style={styles.modalTitle}>{selectedLevelModal?.level.title}</Text>
              <Text style={styles.modalDesc}>{selectedLevelModal?.level.desc}</Text>

              {/* Star Rating & High Score section */}
              {selectedLevelModal?.completed ? (
                <View style={styles.modalStatsBox}>
                  <Text style={styles.modalScoreLabel}>उच्चतम अंक (Best Score)</Text>
                  <Text style={styles.modalScoreValue}>{selectedLevelModal.score}%</Text>
                  <View style={styles.modalStarsRow}>
                    <Text style={styles.modalStarText}>
                      {"⭐".repeat(selectedLevelModal.stars) +
                        "☆".repeat(3 - selectedLevelModal.stars)}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.modalUnlockNotice}>
                  <Text style={styles.modalNoticeIcon}>⚡</Text>
                  <Text style={styles.modalNoticeText}>
                    इस स्तर को पूरा करने पर 50 EXP और 20 सिक्के (Coins) मिलेंगे!
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  title="शुरू करें (Play)"
                  variant="primary"
                  onPress={handleStartLevel}
                />
                <Pressable
                  onPress={() => setSelectedLevelModal(null)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseText}>बाद में (Close)</Text>
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
  return [styles.starIcon, active ? null : { opacity: 0.3 }];
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, // Sky blue theme
  },
  container: {
    flex: 1,
    position: "relative",
  },
  bgHillTopLeft: {
    position: "absolute",
    top: -40,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ccefff",
    zIndex: -2,
  },
  bgHillTopRight: {
    position: "absolute",
    top: 60,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#bbf0d8",
    opacity: 0.5,
    zIndex: -2,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 110, // space for bottom dock
    alignItems: "center",
  },
  headerCard: {
    width: SCREEN_WIDTH - 32,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md + 4,
    padding: 14,
    borderWidth: 3,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.borderDark,
    marginBottom: 20,
    elevation: 4,
  },
  headerCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  headerBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.warning,
    borderWidth: 2,
    borderColor: COLORS.warningDark,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerBadgeText: {
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

  finishArchContainer: {
    marginBottom: 10,
    alignItems: "center",
  },
  finishArchPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffe082",
    borderWidth: 3,
    borderColor: "#e6a100",
    borderBottomWidth: 5,
    borderBottomColor: "#c28800",
    borderRadius: RADII.md,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    elevation: 3,
  },
  finishArchFlag: {
    fontSize: 18,
  },
  finishArchText: {
    ...TYPOGRAPHY.heading,
    fontSize: 14,
    color: "#6b4900",
  },

  pathWrapper: {
    width: "100%",
    alignItems: "center",
  },
  nodeRow: {
    marginVertical: 22,
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  pathConnector: {
    position: "absolute",
    top: 60,
    height: 48,
    backgroundColor: COLORS.backgroundDark,
    borderRadius: 6,
    zIndex: -1,
    borderWidth: 1.5,
    borderColor: "#90cceb",
  },
  connectorDots: {
    width: "100%",
    height: "100%",
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 6,
  },

  nodeContainer: {
    alignItems: "center",
    position: "relative",
  },
  activeGlowRing: {
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
    overflow: "visible",
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

  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
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

  mascotCallout: {
    position: "absolute",
    top: -5,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 20,
    gap: 6,
  },
  mascotLeft: {
    left: -140,
  },
  mascotRight: {
    right: -140,
    flexDirection: "row-reverse",
  },
  speechBubble: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: RADII.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    position: "relative",
    elevation: 4,
  },
  bubbleArrow: {
    position: "absolute",
    right: -6,
    top: "40%",
    width: 10,
    height: 10,
    backgroundColor: COLORS.white,
    borderRightWidth: 2,
    borderTopWidth: 2,
    borderColor: COLORS.accent,
    transform: [{ rotate: "45deg" }],
  },
  speechText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.text,
  },

  bottomDock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "#ffffff",
    borderTopWidth: 3,
    borderTopColor: COLORS.backgroundDark,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 10,
  },
  dockItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    position: "relative",
  },
  dockItemActive: {
    backgroundColor: "#e8f7ff",
    borderRadius: RADII.md,
  },
  dockIcon: {
    fontSize: 22,
  },
  dockLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  dockLabelActive: {
    color: COLORS.accent,
    fontWeight: "700",
  },
  dockBadge: {
    position: "absolute",
    top: 2,
    right: 22,
    backgroundColor: COLORS.error,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  dockBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  emptyMascot: {
    marginBottom: 16,
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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.backgroundDark,
    elevation: 10,
  },
  modalHeaderBg: {
    alignItems: "center",
    marginBottom: 12,
  },
  modalHeaderIcon: {
    fontSize: 48,
  },
  modalHeaderBadge: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.accent,
    backgroundColor: "#e8f7ff",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
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
  modalUnlockNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff9e6",
    padding: 10,
    borderRadius: RADII.md,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: COLORS.warningDark,
  },
  modalNoticeIcon: {
    fontSize: 18,
  },
  modalNoticeText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
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
