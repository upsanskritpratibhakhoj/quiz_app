import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Mascot from "../components/ui/Mascot";
import { BAL_VARG_CATEGORIES, YUVA_VARG_CATEGORIES } from "../constants/quizCategories";

export default function CategoriesScreen() {
  const params = useLocalSearchParams();
  const pathSelection = (params.pathSelection as string) || "beginner";
  const isBeginner = pathSelection === "beginner";

  const categories = isBeginner ? BAL_VARG_CATEGORIES : YUVA_VARG_CATEGORIES;
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleStartLesson = () => {
    if (!selectedCategory) return;
    Alert.alert(
      "शुरुआत करें! 🚀",
      `Are you ready to practice "${selectedCategory}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Let's Go",
          onPress: () => {
            // Placeholder for next logic, or back to dashboard
            router.replace("/dashboard");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Button
            title="← Back"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>
            {isBeginner ? "बाल वर्ग (6-12)" : "युवा वर्ग (B.A.-M.A.)"}
          </Text>
          <View style={{ width: 80 }} />
        </View>

        <View style={styles.mascotSection}>
          <Mascot expression="guiding" size={80} style={styles.mascot} />
          <View style={styles.bubble}>
            <View style={styles.bubbleArrow} />
            <Text style={styles.bubbleText}>
              {isBeginner
                ? "अति उत्तम! Let's choose a Sanskrit topic to start practicing!"
                : "शानदार! Choose a college-level Sanskrit topic to test your knowledge!"}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            const initialChar = category.charAt(0);
            return (
              <Card
                key={category}
                selected={isSelected}
                onPress={() => setSelectedCategory(category)}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>{initialChar}</Text>
                  </View>
                  <Text style={styles.cardText}>{category}</Text>
                </View>
              </Card>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={selectedCategory ? "Start Lesson" : "Select a Topic"}
            variant="primary"
            onPress={handleStartLesson}
            disabled={!selectedCategory}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background, // pale sky-blue background
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  backButton: {
    width: 80,
    height: 40,
  },
  headerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 18,
    color: COLORS.accent,
    textAlign: "center",
    flex: 1,
  },
  mascotSection: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    paddingRight: 10,
  },
  mascot: {
    marginRight: 10,
  },
  bubble: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    borderWidth: 2,
    borderColor: COLORS.backgroundDark,
    padding: 12,
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
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.backgroundDark,
    transform: [{ rotate: "45deg" }],
  },
  bubbleText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18,
  },
  list: {
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    height: 68,
    width: "100%",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 12,
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    ...TYPOGRAPHY.body,
    fontSize: 16,
    color: COLORS.accent,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
