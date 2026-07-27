import React from "react";
import { router } from "expo-router";
import OnboardingContainer from "../components/onboarding/OnboardingContainer";

export default function Index() {
  const handleOnboardingComplete = (data: {
    language: string;
    motivation: string;
    dailyGoal: number;
    pathSelection: string;
  }) => {
    // Navigate to dashboard and pass the chosen options as parameters
    router.replace({
      pathname: "/dashboard",
      params: {
        language: data.language,
        motivation: data.motivation,
        dailyGoal: data.dailyGoal.toString(),
        pathSelection: data.pathSelection,
      },
    });
  };

  return <OnboardingContainer onComplete={handleOnboardingComplete} />;
}
