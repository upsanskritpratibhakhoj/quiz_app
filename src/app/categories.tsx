import React, { useState } from "react";
import { StyleSheet, Text, View, ScrollView, Alert, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../constants/theme";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Mascot from "../components/ui/Mascot";
import { BAL_VARG_CATEGORIES, YUVA_VARG_CATEGORIES } from "../constants/quizCategories";
import TopStatsBar from "../components/ui/TopStatsBar";


export default function CategoriesScreen() {
  const params = useLocalSearchParams();
  const pathSelection = (params.pathSelection as string) || "beginner";
  const isBeginner = pathSelection === "beginner";

  const categories = isBeginner ? BAL_VARG_CATEGORIES : YUVA_VARG_CATEGORIES;
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { width } = useWindowDimensions();
  const cardSize = (width - 40 - 12) / 2;

  const handleStartLesson = () => {
    if (!selectedCategory) return;
    router.push({
      pathname: "/exerciseSelection",
      params: {
        category: selectedCategory,
        pathSelection: pathSelection,
      },
    });
  };

  const handleBack = async () => {
    try {
      await AsyncStorage.removeItem("pathSelection");
    } catch (e) {
      console.error("Failed to clear pathSelection:", e);
    }
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopStatsBar
        title={isBeginner ? "बाल वर्ग (6-12)" : "युवा वर्ग (B.A.-M.A.)"}
        onBack={handleBack}
      />
      <View style={styles.container}>


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
                style={StyleSheet.flatten([styles.card, { width: cardSize, height: cardSize }])}
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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 20,
    gap: 12,
  },
  card: {
    // Dynamically sized
  },
  cardContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    paddingHorizontal: 4,
  },
  cardText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.backgroundDark,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    ...TYPOGRAPHY.body,
    fontSize: 18,
    color: COLORS.accent,
  },
  footer: {
    paddingBottom: SPACING.md,
    paddingTop: 10,
  },
});
