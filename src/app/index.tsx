import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingContainer from "../components/onboarding/OnboardingContainer";
import { COLORS } from "../constants/theme";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialStep, setInitialStep] = useState(0);

  useEffect(() => {
    const checkOnboardingState = async () => {
      try {
        const pathSelection = await AsyncStorage.getItem("pathSelection");
        if (pathSelection) {
          // Path already selected, go directly to categories
          router.replace({
            pathname: "/categories",
            params: { pathSelection },
          });
          return;
        }

        const hasCompletedOnboarding = await AsyncStorage.getItem("hasCompletedOnboarding");
        if (hasCompletedOnboarding === "true") {
          // Completed welcome/goal onboarding step, start directly at StepPath (step 2)
          setInitialStep(2);
        }
      } catch (e) {
        console.error("Failed to load onboarding state", e);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingState();
  }, []);

  const handleOnboardingComplete = async (data: {
    language: string;
    motivation: string;
    dailyGoal: number;
    pathSelection: string;
  }) => {
    try {
      // Save path selection
      await AsyncStorage.setItem("pathSelection", data.pathSelection);
    } catch (e) {
      console.error("Failed to save path selection", e);
    }

    // Go directly to categories screen, bypassing dashboard.tsx
    router.replace({
      pathname: "/categories",
      params: {
        pathSelection: data.pathSelection,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.white }}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <OnboardingContainer
      initialStep={initialStep}
      onComplete={handleOnboardingComplete}
    />
  );
}
