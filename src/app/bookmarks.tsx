import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useGame, BookmarkedQuestion } from "../context/GameContext";
import { COLORS, TYPOGRAPHY, RADII } from "../constants/theme";
import Mascot from "../components/ui/Mascot";
import Button from "../components/ui/Button";

export default function BookmarksScreen() {
  const { bookmarks, removeBookmark } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeQuestion, setActiveQuestion] = useState<BookmarkedQuestion | null>(null);

  // Extract unique categories from bookmarks for filter chips
  const categories = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [bookmarks]);

  // Filter bookmarks based on category chip selection
  const filteredBookmarks = useMemo(() => {
    if (selectedCategory === "all") return bookmarks;
    return bookmarks.filter((b) => b.category === selectedCategory);
  }, [bookmarks, selectedCategory]);

  const formatQuizTypeLabel = (type: string): string => {
    switch (type) {
      case "MCQ":
        return "बहुविकल्पीय";
      case "True_False":
        return "सत्य / असत्य";
      case "Fill_Blank":
        return "रिक्त स्थान";
      case "Match_Following":
        return "जोड़े मिलाएं";
      case "Sentence_Builder":
        return "वाक्य निर्माण";
      case "Word_Builder":
        return "शब्द निर्माण";
      case "Multi_Select":
        return "बहु-चयन";
      case "Sentence_Correction":
        return "वाक्य शुद्धि";
      case "Anvaya_Practice":
        return "अन्वय अभ्यास";
      default:
        return type;
    }
  };

  const renderCorrectAnswerDetails = (q: BookmarkedQuestion) => {
    const rawAns = q.Correct_Answer || "";

    if (q.quizType === "Match_Following") {
      const pairs = rawAns.split(",").map((p) => p.trim()).filter(Boolean);
      return (
        <View style={styles.pairsContainer}>
          {pairs.map((pair, idx) => (
            <View key={idx} style={styles.pairRow}>
              <View style={styles.pairDot} />
              <Text style={styles.pairText}>{pair}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (q.quizType === "Sentence_Builder") {
      return (
        <View style={styles.answerBox}>
          <Text style={styles.answerBoxLabel}>सही वाक्य:</Text>
          <Text style={styles.answerBoxText}>{rawAns.split(";").join(" ")}</Text>
        </View>
      );
    }

    if (q.quizType === "Word_Builder") {
      return (
        <View style={styles.answerBox}>
          <Text style={styles.answerBoxLabel}>सही शब्द:</Text>
          <Text style={styles.answerBoxText}>{rawAns}</Text>
        </View>
      );
    }

    // Standard Option A/B/C/D
    const options = [
      { key: "Option_A", text: q.Option_A, label: "A" },
      { key: "Option_B", text: q.Option_B, label: "B" },
      { key: "Option_C", text: q.Option_C, label: "C" },
      { key: "Option_D", text: q.Option_D, label: "D" },
    ].filter((opt) => opt.text && opt.text.trim() !== "" && opt.text !== "-");

    const isCorrectOption = (key: string, text: string | null) => {
      if (!rawAns) return false;
      if (rawAns.includes(key)) return true;
      if (text && rawAns.includes(text.trim())) return true;
      return false;
    };

    return (
      <View style={styles.optionsList}>
        {options.map((opt) => {
          const isCorrect = isCorrectOption(opt.key, opt.text);
          return (
            <View
              key={opt.key}
              style={[
                styles.optionItem,
                isCorrect && styles.optionItemCorrect,
              ]}
            >
              <View
                style={[
                  styles.optionBadge,
                  isCorrect && styles.optionBadgeCorrect,
                ]}
              >
                <Text
                  style={[
                    styles.optionBadgeText,
                    isCorrect && styles.optionBadgeTextCorrect,
                  ]}
                >
                  {opt.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionItemText,
                  isCorrect && styles.optionItemTextCorrect,
                ]}
              >
                {opt.text}
              </Text>
              {isCorrect && (
                <View style={styles.correctPill}>
                  <Text style={styles.correctPillText}>✓ सही उत्तर</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          hitSlop={12}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>सहेजे गए प्रश्न</Text>
          <Text style={styles.headerSubtitle}>
            {bookmarks.length} प्रश्न उपलब्ध
          </Text>
        </View>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Category Filter Chips Bar */}
      {categories.length > 0 && (
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <Pressable
              onPress={() => setSelectedCategory("all")}
              style={[
                styles.chip,
                selectedCategory === "all" && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === "all" && styles.chipTextActive,
                ]}
              >
                सभी ({bookmarks.length})
              </Text>
            </Pressable>

            {categories.map((cat) => {
              const count = bookmarks.filter((b) => b.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, isSelected && styles.chipTextActive]}
                  >
                    {cat} ({count})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main Content List / Empty State */}
      {filteredBookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Mascot expression="guiding" size={120} />
          <Text style={styles.emptyTitle}>कोई प्रश्न सहेजा नहीं गया</Text>
          <Text style={styles.emptySubtitle}>
            अभ्यास के दौरान किसी भी प्रश्न पर 🔖 बुकमार्क बटन दबाकर उसे यहाँ सहेजें ताकि आप बाद में उसका पुनरावलोकन कर सकें।
          </Text>
          <Button
            title="अभ्यास प्रारंभ करें"
            onPress={() => router.back()}
            variant="primary"
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredBookmarks.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setActiveQuestion(item)}
              style={({ pressed }) => [
                styles.cardOuter,
                pressed && styles.cardOuterPressed,
              ]}
            >
              {/* Card Meta Header */}
              <View style={styles.cardHeader}>
                <View style={styles.tagsContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {formatQuizTypeLabel(item.quizType)}
                    </Text>
                  </View>
                </View>

                {/* Delete Bookmark Button */}
                <Pressable
                  onPress={() => removeBookmark(item.id)}
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  hitSlop={10}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </Pressable>
              </View>

              {/* Question Text */}
              <Text style={styles.cardQuestionText} numberOfLines={3}>
                {item.Question}
              </Text>

              {/* Card Action Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>
                  पूर्ण विवरण एवं व्याख्या देखें →
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Full Question Detail Modal */}
      {activeQuestion && (
        <Modal
          visible={Boolean(activeQuestion)}
          animationType="slide"
          transparent
          onRequestClose={() => setActiveQuestion(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Modal Drag Bar Indicator */}
              <View style={styles.dragHandleContainer}>
                <View style={styles.dragHandle} />
              </View>

              {/* Modal Top Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.tagsContainer}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {activeQuestion.category}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>
                      {formatQuizTypeLabel(activeQuestion.quizType)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setActiveQuestion(null)}
                  style={styles.modalCloseButton}
                  hitSlop={10}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              {/* Scrollable details */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                {/* Question Section with Mascot */}
                <View style={styles.questionSection}>
                  <Mascot expression="happy" size={76} style={{ marginRight: 12 }} />
                  <View style={styles.speechBubble}>
                    <View style={styles.bubbleArrow} />
                    <Text style={styles.modalQuestionText}>
                      {activeQuestion.Question}
                    </Text>
                  </View>
                </View>

                {/* Answer / Options Section */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeader}>उत्तर एवं विकल्प</Text>
                  {renderCorrectAnswerDetails(activeQuestion)}
                </View>

                {/* Grammatical Explanation */}
                {activeQuestion.Explanation && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeader}>व्याकरणिक व्याख्या</Text>
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>
                        {activeQuestion.Explanation}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Vocabulary Breakdown */}
                {activeQuestion.Vocabulary_Breakdown && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionHeader}>शब्दावली एवं पद-परिचय</Text>
                    <View style={styles.vocabBox}>
                      <Text style={styles.vocabText}>
                        {activeQuestion.Vocabulary_Breakdown}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Modal Bottom Actions */}
              <View style={styles.modalFooter}>
                <Button
                  title="बुकमार्क हटाएं"
                  variant="danger"
                  onPress={() => {
                    removeBookmark(activeQuestion.id);
                    setActiveQuestion(null);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  title="बंद करें"
                  variant="primary"
                  onPress={() => setActiveQuestion(null)}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F4F7F9",
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  backButtonPressed: {
    backgroundColor: "#E5E7EB",
  },
  backText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "700",
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E7EB",
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  chipActive: {
    backgroundColor: "#E0F2FE",
    borderColor: "#0EA5E9",
  },
  chipText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#0369A1",
    fontWeight: "700",
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  cardOuter: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderBottomWidth: 4,
    borderBottomColor: "#D1D5DB",
    padding: 16,
  },
  cardOuterPressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  categoryBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: "#0284C7",
    fontWeight: "700",
  },
  typeBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  typeBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "600",
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  deleteButtonPressed: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FCA5A5",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#9CA3AF",
  },
  cardQuestionText: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 23,
    marginBottom: 12,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  viewDetailsText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.text,
    marginTop: 18,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "700",
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 8,
  },
  emptyButton: {
    marginTop: 16,
    width: 200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingTop: 10,
    paddingBottom: 24,
  },
  dragHandleContainer: {
    alignItems: "center",
    paddingVertical: 6,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: "#F3F4F6",
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B7280",
  },
  modalScroll: {
    padding: 20,
    gap: 18,
  },
  questionSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  speechBubble: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: RADII.md,
    padding: 14,
    position: "relative",
  },
  bubbleArrow: {
    position: "absolute",
    left: -7,
    top: "50%",
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: "#F9FAFB",
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#E5E7EB",
    transform: [{ rotate: "45deg" }],
  },
  modalQuestionText: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    ...TYPOGRAPHY.heading,
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "700",
  },
  optionsList: {
    gap: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  optionItemCorrect: {
    backgroundColor: "#E8FFD1",
    borderColor: "#58CC02",
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionBadgeCorrect: {
    backgroundColor: "#58CC02",
    borderColor: "#46A302",
  },
  optionBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "700",
  },
  optionBadgeTextCorrect: {
    color: COLORS.white,
  },
  optionItemText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  optionItemTextCorrect: {
    color: "#166534",
    fontWeight: "700",
  },
  correctPill: {
    backgroundColor: "#58CC02",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  correctPillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
  },
  pairsContainer: {
    gap: 8,
  },
  pairRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8FFD1",
    borderWidth: 1.5,
    borderColor: "#58CC02",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  pairDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#58CC02",
  },
  pairText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: "#166534",
    fontWeight: "700",
  },
  answerBox: {
    backgroundColor: "#E8FFD1",
    borderWidth: 1.5,
    borderColor: "#58CC02",
    borderRadius: 12,
    padding: 14,
    gap: 4,
  },
  answerBoxLabel: {
    fontSize: 11,
    color: "#15803D",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  answerBoxText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: "#166534",
    fontWeight: "700",
    lineHeight: 22,
  },
  explanationBox: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    borderRadius: 12,
    padding: 14,
  },
  explanationText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: "#166534",
    lineHeight: 21,
  },
  vocabBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
  },
  vocabText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: "#334155",
    lineHeight: 21,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 14,
    gap: 12,
    borderTopWidth: 1.5,
    borderTopColor: "#F3F4F6",
  },
});
