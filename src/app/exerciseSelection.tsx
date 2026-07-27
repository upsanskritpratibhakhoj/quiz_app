import React from "react";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../constants/theme";
import Card from "../components/ui/Card";
import Mascot from "../components/ui/Mascot";
import TopStatsBar from "../components/ui/TopStatsBar";
import questionsRegistry from "../constants/questionsRegistry.json";

const TYPE_NAMES: Record<string, { title: string; desc: string; icon: string }> = {
  MCQ: {
    title: "बहुविकल्पीय प्रश्न (MCQ)",
    desc: "चार विकल्पों में से सही उत्तर का चयन करें।",
    icon: "❓",
  },
  Fill_Blank: {
    title: "रिक्त स्थान भरें (Fill Blank)",
    desc: "वाक्य के खाली स्थान में सही पद भरें।",
    icon: "✍️",
  },
  Multi_Select: {
    title: "बहु-विकल्प चयन (Multi Select)",
    desc: "एक से अधिक सही उत्तरों को चुनें।",
    icon: "☑️",
  },
  Match_Following: {
    title: "उचित मिलान करें (Match Following)",
    desc: "स्तंभों के सही शब्दों का आपस में मिलान करें।",
    icon: "🤝",
  },
  Sentence_Correction: {
    title: "वाक्य संशोधन (Sentence Correction)",
    desc: "अशुद्ध वाक्यों में व्याकरण की अशुद्धि सुधारें।",
    icon: "🔧",
  },
  Anvaya_Practice: {
    title: "अन्वय लेखन अभ्यास (Anvaya)",
    desc: "संस्कृत श्लोकों को गद्य क्रम में व्यवस्थित करें।",
    icon: "📖",
  },
  Sentence_Builder: {
    title: "वाक्य निर्माण (Sentence Builder)",
    desc: "शब्दों को उचित क्रम में लगाकर वाक्य बनाएं।",
    icon: "🧱",
  },
  True_False: {
    title: "सत्य या असत्य (True/False)",
    desc: "जांचें कि दिया गया वाक्य सही है या गलत।",
    icon: "⚖️",
  },
  Word_Connect: {
    title: "शब्द संधान (Word Connect)",
    desc: "शब्दों के सही अर्थों का संयोग करें।",
    icon: "🔗",
  },
  Vocabulary_Breakdown: {
    title: "शब्दावली विश्लेषण (Vocabulary)",
    desc: "शब्दों के विच्छेद और अर्थ को समझें।",
    icon: "🧐",
  },
};

export default function ExerciseSelectionScreen() {
  const params = useLocalSearchParams();
  const category = (params.category as string) || "";
  const pathSelection = (params.pathSelection as string) || "beginner";

  const classGroup = pathSelection === "beginner" ? "बाल वर्ग (6-12)" : "युवा वर्ग (B.A.-M.A.)";
  const categoryData = (questionsRegistry as any)[classGroup]?.[category] || {};
  const questionTypes = Object.keys(categoryData);

  const handleSelectType = (type: string) => {
    if (type === "MCQ") {
      router.push({
        pathname: "/quiz",
        params: {
          category,
          pathSelection,
          questionType: "MCQ",
        },
      });
    } else {
      Alert.alert(
        "जल्द आ रहा है! 🚀",
        `"${type}" अभ्यास प्रकार पर अभी काम चल रहा है। कृपया अभ्यास के लिए "MCQ" चुनें।`,
        [{ text: "ठीक है" }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopStatsBar title={category} onBack={() => router.back()} />

      <View style={styles.container}>
        {/* Mascot Greeting */}
        <View style={styles.mascotSection}>
          <Mascot expression="guiding" size={80} style={styles.mascot} />
          <View style={styles.bubble}>
            <View style={styles.bubbleArrow} />
            <Text style={styles.bubbleText}>
              चलो अभ्यास करें! इस श्रेणी में उपलब्ध अभ्यास प्रकार चुनें।
            </Text>
          </View>
        </View>

        {questionTypes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              इस श्रेणी में कोई अभ्यास उपलब्ध नहीं है। कृपया कोई अन्य श्रेणी चुनें।
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {questionTypes.map((type) => {
              const meta = TYPE_NAMES[type] || {
                title: type.replace("_", " "),
                desc: "संस्कृत व्याकरण का अभ्यास करें।",
                icon: "📝",
              };
              const isSupported = type === "MCQ";

              return (
                <Card
                  key={type}
                  selected={false}
                  onPress={() => handleSelectType(type)}
                  style={styles.card}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.iconContainer}>
                      <Text style={styles.iconText}>{meta.icon}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <View style={styles.titleRow}>
                        <Text style={styles.cardTitle}>{meta.title}</Text>
                        {!isSupported && (
                          <View style={styles.badge}>
                            <Text style={styles.badgeText}>SOON</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.cardDesc}>{meta.desc}</Text>
                    </View>
                  </View>
                </Card>
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
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    paddingBottom: 30,
    gap: 15,
  },
  card: {
    width: "100%",
    paddingVertical: 4,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  cardTitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontSize: 15,
  },
  cardDesc: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  badge: {
    backgroundColor: COLORS.backgroundDark,
    borderRadius: RADII.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    ...TYPOGRAPHY.body,
    fontSize: 8,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyRegular,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
});
