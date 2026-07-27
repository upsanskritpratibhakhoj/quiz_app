import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../constants/theme";
import Mascot from "../components/ui/Mascot";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import { useGame } from "../context/GameContext";
import questionsRegistry from "../constants/questionsRegistry.json";

interface QuestionData {
  Question: string;
  Option_A: string;
  Option_B: string;
  Option_C: string;
  Option_D: string;
  Correct_Answer: string;
  Explanation?: string;
  Vocabulary_Breakdown?: string;
}

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";
  const pathSelection = (params.pathSelection as string) || "beginner";
  const questionType = (params.questionType as string) || "MCQ";

  const {
    hearts,
    coins,
    loseHeart,
    addCoins,
    addExp,
    buyHeartWithCoins,
    refillHeartsWithCoins,
  } = useGame();

  // Load questions
  const classGroup = pathSelection === "beginner" ? "बाल वर्ग (6-12)" : "युवा वर्ग (B.A.-M.A.)";
  const rawQuestions = ((questionsRegistry as any)[classGroup]?.[category]?.[questionType] || []) as QuestionData[];

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Shop state when out of hearts
  const [outOfHeartsModalVisible, setOutOfHeartsModalVisible] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

  // Shuffle or slice questions on mount
  useEffect(() => {
    if (rawQuestions.length > 0) {
      // Keep up to 10 questions for a standard Duolingo lesson
      setQuestions(rawQuestions.slice(0, 10));
    }
  }, [category, pathSelection]);

  // Watch for out of hearts
  useEffect(() => {
    if (hearts === 0 && !quizFinished) {
      setOutOfHeartsModalVisible(true);
    }
  }, [hearts]);

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>इस श्रेणी में अभ्यास लोड नहीं हो सका।</Text>
          <Button title="वापस जाएं" onPress={() => router.back()} style={{ width: 150 }} />
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (option: string) => {
    if (isChecked) return;
    setSelectedOption(option);
  };

  const handleCheck = async () => {
    if (!selectedOption || isChecked) return;

    const correct = selectedOption === currentQuestion.Correct_Answer;
    setIsCorrect(correct);
    setIsChecked(true);

    if (!correct) {
      // Deduct a heart
      await loseHeart();
    }
  };

  const handleContinue = () => {
    // Reset checking states
    setSelectedOption(null);
    setIsChecked(false);

    // Proceed to next question or finish
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finished all questions!
      setQuizFinished(true);
    }
  };

  const handleQuitRequest = () => {
    Alert.alert(
      "क्या आप पाठ छोड़ना चाहते हैं? ⚠️",
      "यदि आप अभी बाहर जाते हैं, तो आपकी पाठ की प्रगति खो जाएगी।",
      [
        { text: "सीखना जारी रखें", style: "cancel" },
        { text: "हाँ, बाहर जाएं", style: "destructive", onPress: () => router.replace("/categories") },
      ]
    );
  };

  const handleBuyOneHeart = async () => {
    setShopLoading(true);
    const result = await buyHeartWithCoins();
    setShopLoading(false);
    if (result.success) {
      setOutOfHeartsModalVisible(false);
    } else {
      Alert.alert("ओह! ⚠️", result.message);
    }
  };

  const handleRefillAllHearts = async () => {
    setShopLoading(true);
    const result = await refillHeartsWithCoins();
    setShopLoading(false);
    if (result.success) {
      setOutOfHeartsModalVisible(false);
    } else {
      Alert.alert("ओह! ⚠️", result.message);
    }
  };

  const handleFinishQuiz = async () => {
    // Reward stats
    await addCoins(5);
    await addExp(10);
    // Go back to categories
    router.replace("/categories");
  };

  // Render Success Screen
  if (quizFinished) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Mascot expression="excited" size={160} style={styles.successMascot} />
          
          <Text style={styles.successTitle}>पाठ पूर्ण! 🎉</Text>
          <Text style={styles.successSubtitle}>अति उत्तम! आपने अभ्यास को सफलतापूर्वक पूरा किया।</Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>⚡</Text>
              <Text style={styles.rewardValue}>+10 EXP</Text>
              <Text style={styles.rewardLabel}>अनुभव अंक</Text>
            </View>

            <View style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>🪙</Text>
              <Text style={styles.rewardValue}>+5 सिक्के</Text>
              <Text style={styles.rewardLabel}>स्वर्ण सिक्के</Text>
            </View>
          </View>

          <View style={styles.successFooter}>
            <Button title="जारी रखें (Continue)" onPress={handleFinishQuiz} variant="primary" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Options keys helper
  const options = [
    { key: "Option_A", label: "A", text: currentQuestion.Option_A },
    { key: "Option_B", label: "B", text: currentQuestion.Option_B },
    { key: "Option_C", label: "C", text: currentQuestion.Option_C },
    { key: "Option_D", label: "D", text: currentQuestion.Option_D },
  ];

  // Mascot expression based on state
  let mascotExpression: "happy" | "excited" | "guiding" = "happy";
  if (isChecked) {
    mascotExpression = isCorrect ? "excited" : "guiding";
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Lesson Header */}
      <View style={styles.header}>
        <Pressable onPress={handleQuitRequest} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <View style={styles.progressContainer}>
          <ProgressBar progress={(currentIndex) / totalQuestions} />
        </View>
        <View style={styles.heartsContainer}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.heartText}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mascot Speech Bubble */}
        <View style={styles.mascotSection}>
          <Mascot expression={mascotExpression} size={100} style={styles.mascot} />
          <View style={styles.bubble}>
            <View style={styles.bubbleArrow} />
            <Text style={styles.questionText}>{currentQuestion.Question}</Text>
          </View>
        </View>

        {/* Options List */}
        <View style={styles.optionsContainer}>
          {options.map((opt) => {
            const isOptSelected = selectedOption === opt.key;
            let cardVariant: "accent" | "primary" = "accent";
            
            // If checked, highlight correct/incorrect
            let optionStyle = {};
            if (isChecked) {
              if (opt.key === currentQuestion.Correct_Answer) {
                // Correct answer style (Greenish borders)
                cardVariant = "primary";
              }
            }

            return (
              <Card
                key={opt.key}
                selected={isOptSelected}
                variant={cardVariant}
                onPress={() => handleSelectOption(opt.key)}
                style={styles.optionCard}
              >
                <View style={styles.optionCardContent}>
                  <View
                    style={[
                      styles.optionBadge,
                      isOptSelected && styles.optionBadgeSelected,
                      isChecked && opt.key === currentQuestion.Correct_Answer && styles.optionBadgeCorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBadgeText,
                        isOptSelected && styles.optionBadgeTextSelected,
                        isChecked && opt.key === currentQuestion.Correct_Answer && styles.optionBadgeTextCorrect,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={styles.optionText}>{opt.text}</Text>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer / Check Panel */}
      <View
        style={[
          styles.footer,
          isChecked && (isCorrect ? styles.footerCorrect : styles.footerIncorrect),
        ]}
      >
        {isChecked && (
          <View style={styles.feedbackContainer}>
            <Text style={[styles.feedbackTitle, isCorrect ? styles.textCorrect : styles.textIncorrect]}>
              {isCorrect ? "अति उत्तम! 🎉 (Correct!)" : "अशुद्धम् ⚠️ (Incorrect)"}
            </Text>
            
            {/* Show explanation & vocabulary */}
            <ScrollView style={styles.explanationScroll} nestedScrollEnabled>
              {!isCorrect && (
                <Text style={styles.correctAnswerLabel}>
                  सही उत्तर: {currentQuestion[currentQuestion.Correct_Answer as keyof QuestionData]}
                </Text>
              )}
              {currentQuestion.Explanation && (
                <Text style={styles.explanationText}>
                  💡 {currentQuestion.Explanation}
                </Text>
              )}
              {currentQuestion.Vocabulary_Breakdown && (
                <Text style={styles.vocabText}>
                  📚 {currentQuestion.Vocabulary_Breakdown}
                </Text>
              )}
            </ScrollView>
          </View>
        )}

        <Button
          title={isChecked ? "आगे बढ़ें (Continue)" : "जांचें (Check)"}
          variant={isChecked ? (isCorrect ? "primary" : "danger") : "accent"}
          disabled={!selectedOption}
          onPress={isChecked ? handleContinue : handleCheck}
        />
      </View>

      {/* Game Over / Out of Hearts Modal */}
      <Modal
        visible={outOfHeartsModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.shopOverlay}>
          <View style={styles.shopContainer}>
            <Mascot expression="guiding" size={110} style={styles.shopMascot} />
            
            <Text style={styles.shopTitle}>दिल समाप्त! (Out of Hearts)</Text>
            <Text style={styles.shopSubtitle}>
              अरे नहीं! आपके पास कोई दिल (Hearts) नहीं बचा है। पाठ जारी रखने के लिए रीफिल करें!
            </Text>

            <View style={styles.shopBalanceRow}>
              <Text style={styles.balanceLabel}>आपके पास सिक्के (Coins) हैं:</Text>
              <Text style={styles.balanceValue}>🪙 {coins}</Text>
            </View>

            <View style={styles.shopOptions}>
              {/* Option 1: Buy 1 heart */}
              <View style={styles.shopCard}>
                <View style={styles.shopCardLeft}>
                  <Text style={styles.shopCardTitle}>+1 दिल (Heart)</Text>
                  <Text style={styles.shopCardCost}>🪙 20 सिक्के</Text>
                </View>
                <Button
                  title="खरीदें"
                  variant="accent"
                  disabled={coins < 20 || shopLoading}
                  onPress={handleBuyOneHeart}
                  style={styles.shopCardBtn}
                />
              </View>

              {/* Option 2: Full refill */}
              <View style={styles.shopCard}>
                <View style={styles.shopCardLeft}>
                  <Text style={styles.shopCardTitle}>पूरा रीफिल (5 Hearts)</Text>
                  <Text style={styles.shopCardCost}>🪙 100 सिक्के</Text>
                </View>
                <Button
                  title="रीफिल"
                  variant="primary"
                  disabled={coins < 100 || shopLoading}
                  onPress={handleRefillAllHearts}
                  style={styles.shopCardBtn}
                />
              </View>
            </View>

            <Pressable
              onPress={() => {
                setOutOfHeartsModalVisible(false);
                router.replace("/categories");
              }}
              style={styles.quitQuizBtn}
            >
              <Text style={styles.quitQuizBtnText}>पाठ छोड़ें (Quit Lesson)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.textMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: 6,
  },
  closeText: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textMuted,
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  heartsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.whiteDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heartIcon: {
    fontSize: 15,
  },
  heartText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150, // Keep space for bottom feedback bar
  },
  mascotSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  mascot: {
    marginRight: 12,
  },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    borderWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    padding: 14,
    position: "relative",
  },
  bubbleArrow: {
    position: "absolute",
    left: -7,
    top: "50%",
    marginTop: -7,
    width: 12,
    height: 12,
    backgroundColor: COLORS.white,
    borderLeftWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    transform: [{ rotate: "45deg" }],
  },
  questionText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    width: "100%",
  },
  optionCardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionBadgeSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent,
  },
  optionBadgeCorrect: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  optionBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  optionBadgeTextSelected: {
    color: COLORS.white,
  },
  optionBadgeTextCorrect: {
    color: COLORS.onPrimary,
  },
  optionText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    gap: 12,
  },
  footerCorrect: {
    backgroundColor: "#d7f5b2", // Soft green
    borderTopColor: "#b2e67a",
  },
  footerIncorrect: {
    backgroundColor: "#ffdbdb", // Soft red
    borderTopColor: "#ffadad",
  },
  feedbackContainer: {
    maxHeight: 140,
    marginBottom: 5,
  },
  feedbackTitle: {
    ...TYPOGRAPHY.display,
    fontSize: 18,
    marginBottom: 6,
  },
  textCorrect: {
    color: "#4b8a08",
  },
  textIncorrect: {
    color: COLORS.errorDark,
  },
  explanationScroll: {
    flex: 1,
  },
  correctAnswerLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.errorDark,
    marginBottom: 4,
  },
  explanationText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 4,
  },
  vocabText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  successMascot: {
    marginBottom: 20,
  },
  successTitle: {
    ...TYPOGRAPHY.display,
    fontSize: 26,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  rewardsRow: {
    flexDirection: "row",
    gap: 20,
    width: "100%",
    marginBottom: 40,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 5,
    borderBottomColor: COLORS.borderDark,
  },
  rewardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  rewardValue: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 2,
  },
  rewardLabel: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  successFooter: {
    width: "100%",
  },
  shopOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  shopContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 20,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 6,
    borderBottomColor: COLORS.borderDark,
  },
  shopMascot: {
    marginBottom: 10,
  },
  shopTitle: {
    ...TYPOGRAPHY.display,
    fontSize: 20,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  shopSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  shopBalanceRow: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
    borderRadius: RADII.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  balanceLabel: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.text,
  },
  balanceValue: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
  },
  shopOptions: {
    width: "100%",
    gap: 10,
    marginBottom: 20,
  },
  shopCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  shopCardLeft: {
    flex: 1,
  },
  shopCardTitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
  },
  shopCardCost: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  shopCardBtn: {
    width: 80,
    height: 38,
  },
  quitQuizBtn: {
    marginTop: 5,
    paddingVertical: 8,
  },
  quitQuizBtnText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.error,
    textDecorationLine: "underline",
  },
});
