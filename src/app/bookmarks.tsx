import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useGame, BookmarkedQuestion } from "../context/GameContext";
import { COLORS, TYPOGRAPHY, RADII } from "../constants/theme";
import Mascot from "../components/ui/Mascot";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

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
        return "बहुविकल्पीय (MCQ)";
      case "True_False":
        return "सत्य / असत्य";
      case "Fill_Blank":
        return "रिक्त स्थान पूर्ति";
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
              <Text style={styles.pairText}>{pair}</Text>
            </View>
          ))}
        </View>
      );
    }

    if (q.quizType === "Sentence_Builder") {
      return (
        <View style={styles.answerBox}>
          <Text style={styles.answerBoxText}>{rawAns.split(";").join(" ")}</Text>
        </View>
      );
    }

    if (q.quizType === "Word_Builder") {
      return (
        <View style={styles.answerBox}>
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
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>सहेजे गए प्रश्न</Text>
          <Text style={styles.headerSubtitle}>
            {bookmarks.length} प्रश्न बुकमार्क किए गए
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {/* Category Filter Chips */}
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

      {/* Main Content Area */}
      {filteredBookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Mascot expression="guiding" size={110} />
          <Text style={styles.emptyTitle}>कोई प्रश्न सहेजा नहीं गया</Text>
          <Text style={styles.emptySubtitle}>
            अभ्यास के दौरान किसी भी प्रश्न पर 🔖 बुकमार्क बटन दबाकर उसे यहाँ सहेजें।
          </Text>
          <Button
            title="अभ्यास शुरू करें"
            onPress={() => router.back()}
            variant="primary"
            style={{ width: 180, marginTop: 15 }}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredBookmarks.map((item) => (
            <Card
              key={item.id}
              variant="default"
              onPress={() => setActiveQuestion(item)}
              style={styles.questionCard}
            >
              {/* Card Meta Header */}
              <View style={styles.cardHeader}>
                <View style={styles.tagsRow}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>
                      {formatQuizTypeLabel(item.quizType)}
                    </Text>
                  </View>
                </View>

                {/* Remove button */}
                <Pressable
                  onPress={() => removeBookmark(item.id)}
                  style={styles.deleteButton}
                  hitSlop={8}
                >
                  <Text style={styles.deleteButtonText}>✕</Text>
                </Pressable>
              </View>

              {/* Question preview text */}
              <Text style={styles.cardQuestionText} numberOfLines={3}>
                {item.Question}
              </Text>

              {/* Card Footer Hint */}
              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>
                  पूर्ण विवरण एवं व्याख्या देखें →
                </Text>
              </View>
            </Card>
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
              {/* Modal Top Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTags}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>
                      {activeQuestion.category}
                    </Text>
                  </View>
                  <View style={styles.typeTag}>
                    <Text style={styles.typeTagText}>
                      {formatQuizTypeLabel(activeQuestion.quizType)}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => setActiveQuestion(null)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </Pressable>
              </View>

              {/* Scrollable details */}
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScroll}
              >
                {/* Question with Mascot */}
                <View style={styles.questionSection}>
                  <Mascot expression="happy" size={70} style={{ marginRight: 10 }} />
                  <View style={styles.bubble}>
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
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
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
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADII.full || 20,
    backgroundColor: COLORS.whiteDark,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: "#e0f2fe",
    borderColor: COLORS.accent,
  },
  chipText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.accentDark,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  questionCard: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.borderDark,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  categoryTag: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  categoryTagText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: "#0369a1",
    fontWeight: "700",
  },
  typeTag: {
    backgroundColor: COLORS.whiteDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeTagText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: COLORS.textMuted,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.whiteDark,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: COLORS.textMuted,
  },
  cardQuestionText: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    alignItems: "flex-end",
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
    paddingHorizontal: 30,
  },
  emptyTitle: {
    ...TYPOGRAPHY.display,
    fontSize: 18,
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
  },
  modalTags: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.whiteDark,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalScroll: {
    padding: 20,
    gap: 20,
  },
  questionSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  bubble: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: 14,
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
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: 10,
    gap: 10,
  },
  optionItemCorrect: {
    backgroundColor: "#e8ffd1",
    borderColor: "#58cc02",
  },
  optionBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.whiteDark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBadgeCorrect: {
    backgroundColor: "#58cc02",
    borderColor: "#46a302",
  },
  optionBadgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: COLORS.text,
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
    color: "#2e7d32",
    fontWeight: "700",
  },
  correctPill: {
    backgroundColor: "#58cc02",
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
    gap: 6,
  },
  pairRow: {
    backgroundColor: "#e8ffd1",
    borderWidth: 1.5,
    borderColor: "#58cc02",
    borderRadius: RADII.md,
    padding: 10,
  },
  pairText: {
    ...TYPOGRAPHY.body,
    fontSize: 14,
    color: "#2e7d32",
    fontWeight: "700",
  },
  answerBox: {
    backgroundColor: "#e8ffd1",
    borderWidth: 1.5,
    borderColor: "#58cc02",
    borderRadius: RADII.md,
    padding: 12,
  },
  answerBoxText: {
    ...TYPOGRAPHY.body,
    fontSize: 15,
    color: "#2e7d32",
    fontWeight: "700",
  },
  explanationBox: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1.5,
    borderColor: "#bbf7d0",
    borderRadius: RADII.md,
    padding: 12,
  },
  explanationText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: "#166534",
    lineHeight: 20,
  },
  vocabBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: 12,
  },
  vocabText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
  },
});
