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
import { buildLevelsForCategory } from "../utils/levelBuilder";

interface QuestionData {
  Question: string;
  Option_A: string;
  Option_B: string | null;
  Option_C: string | null;
  Option_D: string | null;
  Correct_Answer: string;
  Explanation?: string;
  Vocabulary_Breakdown?: string;
}

export default function QuizScreen() {
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";
  const pathSelection = (params.pathSelection as string) || "beginner";
  const levelId = (params.levelId as string) || "";
  const levelIndexStr = (params.levelIndex as string) || "1";

  const {
    hearts,
    coins,
    loseHeart,
    addCoins,
    addExp,
    buyHeartWithCoins,
    refillHeartsWithCoins,
    completeLevel,
  } = useGame();

  // Load questions for the specific level
  const levels = buildLevelsForCategory(category, pathSelection);
  const currentLevel = levels.find((l) => l.levelId === levelId);
  const rawQuestions = (currentLevel?.questions || []) as QuestionData[];

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Interaction States based on quiz type
  // 1. Single Select (MCQ, Fill_Blank, Sentence_Correction, True_False)
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 2. Multi Select (Multi_Select, Vocabulary_Breakdown)
  const [multiSelected, setMultiSelected] = useState<Set<string>>(new Set());

  // 3. Grid Word Select (Word_Connect, Sentence_Builder)
  const [gridSelectedWords, setGridSelectedWords] = useState<Set<string>>(new Set());

  // 4. Word Bank Reordering (Anvaya_Practice)
  const [orderedWords, setOrderedWords] = useState<string[]>([]);

  // 5. Match Following
  const [matchLeftWords, setMatchLeftWords] = useState<string[]>([]);
  const [matchRightWords, setMatchRightWords] = useState<string[]>([]);
  const [matchMap, setMatchMap] = useState<Record<string, string>>({}); // left -> right
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedLeftSet, setMatchedLeftSet] = useState<Set<string>>(new Set());

  // Checking & Validation States
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Game over modal state
  const [outOfHeartsModalVisible, setOutOfHeartsModalVisible] = useState(false);
  const [shopLoading, setShopLoading] = useState(false);

  // Mount/load level questions
  useEffect(() => {
    if (rawQuestions.length > 0) {
      setQuestions(rawQuestions);
    }
  }, [levelId]);

  // Watch for out of hearts
  useEffect(() => {
    if (hearts === 0 && !quizFinished) {
      setOutOfHeartsModalVisible(true);
    }
  }, [hearts]);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const quizType = currentLevel?.type || "MCQ";

  // Initialize helper states when question index changes
  useEffect(() => {
    if (!currentQuestion) return;

    // Reset interaction states
    setSelectedOption(null);
    setMultiSelected(new Set());
    setGridSelectedWords(new Set());
    setOrderedWords([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedLeftSet(new Set());

    // Setup specific states
    if (quizType === "Match_Following") {
      const left = currentQuestion.Option_A.split(",").map((w) => w.trim());
      setMatchLeftWords(left);

      // Parse matches: "Option_A:सुहृत्; Option_B:इन्दुः; ..."
      const mapping: Record<string, string> = {};
      const rightWordsList: string[] = [];

      currentQuestion.Correct_Answer.split(";").forEach((pair) => {
        const parts = pair.split(":");
        if (parts.length === 2) {
          const optKey = parts[0].trim();
          const rWord = parts[1].trim();

          let lWord = "";
          if (optKey === "Option_A") lWord = left[0];
          else if (optKey === "Option_B") lWord = left[1];
          else if (optKey === "Option_C") lWord = left[2];
          else if (optKey === "Option_D") lWord = left[3];

          if (lWord) {
            mapping[lWord] = rWord;
            rightWordsList.push(rWord);
          }
        }
      });

      setMatchMap(mapping);
      // Shuffle right words
      setMatchRightWords([...rightWordsList].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, currentQuestion, quizType]);

  // Verify pair match instantly for Match_Following
  useEffect(() => {
    if (quizType !== "Match_Following" || !selectedLeft || !selectedRight) return;

    const correctMatch = matchMap[selectedLeft] === selectedRight;
    if (correctMatch) {
      // Add to matched set
      setMatchedLeftSet((prev) => {
        const next = new Set(prev);
        next.add(selectedLeft);
        return next;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong pairing deducts heart instantly and resets selections
      Alert.alert("गलत मिलान! ⚠️", `"${selectedLeft}" का मिलान "${selectedRight}" से नहीं है।`);
      loseHeart();
      setSelectedLeft(null);
      setSelectedRight(null);
    }
  }, [selectedLeft, selectedRight, matchMap, quizType]);

  if (questions.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>इस स्तर का अभ्यास लोड नहीं हो सका।</Text>
          <Button title="वापस जाएं" onPress={() => router.back()} style={{ width: 150 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Handle single option tap
  const handleSelectOption = (option: string) => {
    if (isChecked) return;
    setSelectedOption(option);
  };

  // Handle multi select toggle
  const handleToggleMultiSelect = (key: string) => {
    if (isChecked) return;
    setMultiSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Handle grid word toggle
  const handleToggleGridWord = (word: string) => {
    if (isChecked) return;
    setGridSelectedWords((prev) => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  // Handle word bank click
  const handleWordBankPress = (word: string, isFromTop: boolean) => {
    if (isChecked) return;
    if (isFromTop) {
      setOrderedWords((prev) => prev.filter((w) => w !== word));
    } else {
      if (!orderedWords.includes(word)) {
        setOrderedWords((prev) => [...prev, word]);
      }
    }
  };

  const checkDisabled = () => {
    if (isChecked) return false;
    switch (quizType) {
      case "MCQ":
      case "Fill_Blank":
      case "Sentence_Correction":
      case "True_False":
        return !selectedOption;
      case "Multi_Select":
      case "Vocabulary_Breakdown":
        return multiSelected.size === 0;
      case "Word_Connect":
      case "Sentence_Builder":
        return gridSelectedWords.size === 0;
      case "Anvaya_Practice":
        return orderedWords.length === 0;
      case "Match_Following":
        return matchedLeftSet.size < matchLeftWords.length;
      default:
        return true;
    }
  };

  const handleCheck = async () => {
    if (isChecked) return;

    let correct = false;

    if (quizType === "MCQ" || quizType === "Fill_Blank" || quizType === "Sentence_Correction" || quizType === "True_False") {
      correct = selectedOption === currentQuestion.Correct_Answer;
    } else if (quizType === "Multi_Select" || quizType === "Vocabulary_Breakdown") {
      // Split correct answers (e.g. Option_A, Option_B)
      const correctKeys = currentQuestion.Correct_Answer.split(",").map((k) => k.trim());
      const selectedKeys = Array.from(multiSelected);
      correct =
        correctKeys.length === selectedKeys.length &&
        correctKeys.every((k) => selectedKeys.includes(k));
    } else if (quizType === "Word_Connect" || quizType === "Sentence_Builder") {
      // Correct answer e.g. "पङ्कजम्; पद्मम्; सरोजम्"
      const correctWords = currentQuestion.Correct_Answer.split(";").map((w) => w.trim());
      const selectedWords = Array.from(gridSelectedWords);
      correct =
        correctWords.length === selectedWords.length &&
        correctWords.every((w) => selectedWords.includes(w));
    } else if (quizType === "Anvaya_Practice") {
      const correctWords = currentQuestion.Correct_Answer.split(";").map((w) => w.trim());
      correct =
        correctWords.length === orderedWords.length &&
        correctWords.every((w, idx) => orderedWords[idx] === w);
    } else if (quizType === "Match_Following") {
      correct = matchedLeftSet.size === matchLeftWords.length;
    }

    setIsCorrect(correct);
    setIsChecked(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      await loseHeart();
    }
  };

  const handleContinue = () => {
    setIsChecked(false);

    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex(currentIndex + 1);
    } else {
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
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    
    // Save level completion score
    await completeLevel(levelId, finalScore);

    // Reward XP & Coins
    await addCoins(5);
    await addExp(10);

    router.replace({
      pathname: "/exerciseSelection",
      params: { category, pathSelection },
    });
  };

  // Render Lesson Complete Screen
  if (quizFinished) {
    const finalScore = Math.round((correctCount / totalQuestions) * 100);
    const isLevelPassed = finalScore >= 75;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Mascot
            expression={isLevelPassed ? "excited" : "guiding"}
            size={160}
            style={styles.successMascot}
          />

          <Text style={styles.successTitle}>
            {isLevelPassed ? "स्तर पूर्ण! 🎉" : "स्तर समाप्त! 📝"}
          </Text>
          <Text style={styles.successSubtitle}>
            {isLevelPassed
              ? `शानदार! आपने ${finalScore}% अंकों के साथ सफलतापूर्वक यह स्तर पूरा किया और अगला स्तर अनलॉक कर दिया!`
              : `आपने ${finalScore}% अंक प्राप्त किए। अगला स्तर अनलॉक करने के लिए कम से कम 75% अंक की आवश्यकता है। कृपया फिर से प्रयास करें!`}
          </Text>

          <View style={styles.rewardsRow}>
            <View style={styles.rewardCard}>
              <Text style={styles.rewardIcon}>🎯</Text>
              <Text style={styles.rewardValue}>{finalScore}%</Text>
              <Text style={styles.rewardLabel}>प्राप्त अंक</Text>
            </View>

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
            <Button
              title={isLevelPassed ? "आगे बढ़ें (Continue)" : "पुनः प्रयास करें (Retry)"}
              onPress={handleFinishQuiz}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Helper arrays for options
  const filterOptions = () => {
    return [
      { key: "Option_A", label: "A", text: currentQuestion.Option_A },
      { key: "Option_B", label: "B", text: currentQuestion.Option_B },
      { key: "Option_C", label: "C", text: currentQuestion.Option_C },
      { key: "Option_D", label: "D", text: currentQuestion.Option_D },
    ].filter((opt) => opt.text !== null && opt.text !== undefined && opt.text !== "");
  };

  const options = filterOptions();

  // Mascot expression based on correctness
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
          <ProgressBar progress={currentIndex / totalQuestions} />
        </View>
        <View style={styles.heartsContainer}>
          <Text style={styles.heartIcon}>❤️</Text>
          <Text style={styles.heartText}>{hearts}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mascot Speech Bubble */}
        <View style={styles.mascotSection}>
          <Mascot expression={mascotExpression} size={90} style={styles.mascot} />
          <View style={styles.bubble}>
            <View style={styles.bubbleArrow} />
            <Text style={styles.questionText}>
              {quizType === "Match_Following"
                ? "शब्दों के सही जोड़ों का मिलान करें! (Match the correct pairs of words)"
                : quizType === "Anvaya_Practice"
                ? "शब्दों को सही गद्य क्रम में व्यवस्थित करें! (Arrange words in correct order)"
                : currentQuestion.Question}
            </Text>
          </View>
        </View>

        {/* 1. Single Select Render */}
        {(quizType === "MCQ" ||
          quizType === "Fill_Blank" ||
          quizType === "Sentence_Correction" ||
          quizType === "True_False") && (
          <View style={styles.optionsContainer}>
            {options.map((opt) => {
              const isOptSelected = selectedOption === opt.key;
              let cardVariant: "accent" | "primary" = "accent";

              if (isChecked && opt.key === currentQuestion.Correct_Answer) {
                cardVariant = "primary";
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
        )}

        {/* 2. Multi Select Render */}
        {(quizType === "Multi_Select" || quizType === "Vocabulary_Breakdown") && (
          <View style={styles.optionsContainer}>
            {options.map((opt) => {
              const isOptSelected = multiSelected.has(opt.key);
              const correctKeys = currentQuestion.Correct_Answer.split(",").map((k) => k.trim());
              const isCorrectKey = correctKeys.includes(opt.key);

              let cardVariant: "accent" | "primary" = "accent";
              if (isChecked && isCorrectKey) {
                cardVariant = "primary";
              }

              return (
                <Card
                  key={opt.key}
                  selected={isOptSelected}
                  variant={cardVariant}
                  onPress={() => handleToggleMultiSelect(opt.key)}
                  style={styles.optionCard}
                >
                  <View style={styles.optionCardContent}>
                    <View
                      style={[
                        styles.optionBadge,
                        isOptSelected && styles.optionBadgeSelected,
                        isChecked && isCorrectKey && styles.optionBadgeCorrect,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionBadgeText,
                          isOptSelected && styles.optionBadgeTextSelected,
                          isChecked && isCorrectKey && styles.optionBadgeTextCorrect,
                        ]}
                      >
                        {isOptSelected ? "✓" : opt.label}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{opt.text}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        {/* 3. Grid Word Select Render */}
        {(quizType === "Word_Connect" || quizType === "Sentence_Builder") && (
          <View style={styles.wordGridContainer}>
            <Text style={styles.instructionSmall}>निर्देश: सही शब्दों पर टैप करें</Text>
            <View style={styles.wordGrid}>
              {currentQuestion.Option_A.split(",").map((word) => {
                const wClean = word.trim();
                const isWordSelected = gridSelectedWords.has(wClean);
                const correctWords = currentQuestion.Correct_Answer.split(";").map((w) => w.trim());
                const isCorrectWord = correctWords.includes(wClean);

                let badgeStyle = styles.wordBadge;
                if (isWordSelected) badgeStyle = { ...badgeStyle, ...styles.wordBadgeSelected };
                if (isChecked && isCorrectWord) badgeStyle = { ...badgeStyle, ...styles.wordBadgeCorrect };

                return (
                  <Pressable
                    key={wClean}
                    onPress={() => handleToggleGridWord(wClean)}
                    style={badgeStyle}
                  >
                    <Text
                      style={[
                        styles.wordBadgeText,
                        isWordSelected && styles.wordBadgeTextSelected,
                        isChecked && isCorrectWord && styles.wordBadgeTextCorrect,
                      ]}
                    >
                      {wClean}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 4. Word Bank Reordering Render */}
        {quizType === "Anvaya_Practice" && (
          <View style={styles.wordBankContainer}>
            {/* Top target ordered slot */}
            <View style={styles.wordOrderTarget}>
              {orderedWords.length === 0 ? (
                <Text style={styles.wordOrderPlaceholder}>शब्दों पर टैप करके वाक्य बनाएं</Text>
              ) : (
                orderedWords.map((word) => (
                  <Pressable
                    key={word}
                    onPress={() => handleWordBankPress(word, true)}
                    style={styles.wordBadgeSelected}
                  >
                    <Text style={styles.wordBadgeTextSelected}>{word}</Text>
                  </Pressable>
                ))
              )}
            </View>

            {/* Bottom word bank sources */}
            <View style={styles.wordBankGrid}>
              {currentQuestion.Option_A.split(",").map((word) => {
                const wClean = word.trim();
                const isUsed = orderedWords.includes(wClean);

                return (
                  <Pressable
                    key={wClean}
                    onPress={() => !isUsed && handleWordBankPress(wClean, false)}
                    style={[styles.wordBadge, isUsed && styles.wordBadgeDisabled]}
                    disabled={isUsed}
                  >
                    <Text style={[styles.wordBadgeText, isUsed && styles.wordBadgeTextDisabled]}>
                      {wClean}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* 5. Match Following Columns Render */}
        {quizType === "Match_Following" && (
          <View style={styles.matchContainer}>
            {/* Left words column */}
            <View style={styles.matchColumn}>
              <Text style={styles.columnHeader}>संस्कृत पद</Text>
              {matchLeftWords.map((word) => {
                const isMatched = matchedLeftSet.has(word);
                const isSelected = selectedLeft === word;

                return (
                  <Pressable
                    key={word}
                    disabled={isMatched || isChecked}
                    onPress={() => setSelectedLeft(word)}
                    style={[
                      styles.matchCard,
                      isSelected && styles.matchCardSelected,
                      isMatched && styles.matchCardMatched,
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchCardText,
                        isSelected && styles.matchCardTextSelected,
                        isMatched && styles.matchCardTextMatched,
                      ]}
                    >
                      {word} {isMatched && "✅"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Right words column */}
            <View style={styles.matchColumn}>
              <Text style={styles.columnHeader}>सही अर्थ / पर्याय</Text>
              {matchRightWords.map((word) => {
                // Find if this right word is matched to any left word
                const isMatched = matchLeftWords.some(
                  (lWord) => matchedLeftSet.has(lWord) && matchMap[lWord] === word
                );
                const isSelected = selectedRight === word;

                return (
                  <Pressable
                    key={word}
                    disabled={isMatched || isChecked}
                    onPress={() => setSelectedRight(word)}
                    style={[
                      styles.matchCard,
                      isSelected && styles.matchCardSelected,
                      isMatched && styles.matchCardMatched,
                    ]}
                  >
                    <Text
                      style={[
                        styles.matchCardText,
                        isSelected && styles.matchCardTextSelected,
                        isMatched && styles.matchCardTextMatched,
                      ]}
                    >
                      {word} {isMatched && "✅"}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
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

            <ScrollView style={styles.explanationScroll} nestedScrollEnabled>
              {!isCorrect && quizType !== "Match_Following" && (
                <Text style={styles.correctAnswerLabel}>
                  सही उत्तर:{" "}
                  {quizType === "Multi_Select" || quizType === "Vocabulary_Breakdown"
                    ? currentQuestion.Correct_Answer.split(",")
                        .map((key) => {
                          const opt = options.find((o) => o.key === key.trim());
                          return opt ? opt.text : key;
                        })
                        .join(", ")
                    : currentQuestion.Correct_Answer.replace(/;/g, ", ")}
                </Text>
              )}
              {currentQuestion.Explanation && (
                <Text style={styles.explanationText}>💡 {currentQuestion.Explanation}</Text>
              )}
              {currentQuestion.Vocabulary_Breakdown && (
                <Text style={styles.vocabText}>📚 {currentQuestion.Vocabulary_Breakdown}</Text>
              )}
            </ScrollView>
          </View>
        )}

        <Button
          title={isChecked ? "आगे बढ़ें (Continue)" : "जांचें (Check)"}
          variant={isChecked ? (isCorrect ? "primary" : "danger") : "accent"}
          disabled={checkDisabled()}
          onPress={isChecked ? handleContinue : handleCheck}
        />
      </View>

      {/* Game Over / Out of Hearts Modal */}
      <Modal visible={outOfHeartsModalVisible} transparent animationType="slide">
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
    paddingBottom: 160,
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
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 20,
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
  wordGridContainer: {
    marginTop: 10,
  },
  instructionSmall: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  wordGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  wordBadge: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.borderDark,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  wordBadgeSelected: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.accent,
    borderBottomColor: COLORS.accentDark,
  },
  wordBadgeCorrect: {
    backgroundColor: "#d7f5b2",
    borderColor: COLORS.primary,
    borderBottomColor: COLORS.primaryDark,
  },
  wordBadgeDisabled: {
    backgroundColor: COLORS.whiteDark,
    borderColor: COLORS.whiteDark,
    borderBottomWidth: 2,
    opacity: 0.5,
  },
  wordBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text,
  },
  wordBadgeTextSelected: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.accentDark,
  },
  wordBadgeTextCorrect: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.primaryDark,
  },
  wordBadgeTextDisabled: {
    color: COLORS.textMuted,
  },
  wordBankContainer: {
    marginTop: 10,
    gap: 20,
  },
  wordOrderTarget: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 60,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.backgroundDark,
    paddingVertical: 10,
    alignItems: "center",
  },
  wordOrderPlaceholder: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  wordBankGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  matchContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 10,
  },
  matchColumn: {
    flex: 1,
    gap: 10,
  },
  columnHeader: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: 5,
  },
  matchCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.borderDark,
    borderRadius: RADII.md,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  matchCardSelected: {
    borderColor: COLORS.accent,
    borderBottomColor: COLORS.accentDark,
    backgroundColor: COLORS.background,
  },
  matchCardMatched: {
    borderColor: COLORS.primary,
    borderBottomColor: COLORS.primaryDark,
    backgroundColor: "#e8ffd1",
    opacity: 0.8,
  },
  matchCardText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
    textAlign: "center",
  },
  matchCardTextSelected: {
    color: COLORS.accentDark,
  },
  matchCardTextMatched: {
    color: COLORS.primaryDark,
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
    backgroundColor: "#d7f5b2",
    borderTopColor: "#b2e67a",
  },
  footerIncorrect: {
    backgroundColor: "#ffdbdb",
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
    gap: 12,
    width: "100%",
    marginBottom: 40,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: 12,
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: COLORS.backgroundDark,
    borderBottomWidth: 5,
    borderBottomColor: COLORS.borderDark,
  },
  rewardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  rewardValue: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
  },
  rewardLabel: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 10,
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
