import React, { useState } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { COLORS } from "../../constants/theme";
import ProgressBar from "../ui/ProgressBar";

import StepWelcome from "./StepWelcome";
import StepLanguage from "./StepLanguage";
import StepMotivation from "./StepMotivation";
import StepGoal from "./StepGoal";
import StepPath from "./StepPath";

interface OnboardingData {
  language: string;
  motivation: string;
  dailyGoal: number;
  pathSelection: "beginner" | "placement" | "";
}

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  fr: "French",
  de: "German",
  jp: "Japanese",
  it: "Italian",
  kr: "Korean",
};

interface OnboardingContainerProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    language: "",
    motivation: "",
    dailyGoal: 10, // default 10 minutes
    pathSelection: "",
  });

  const nextStep = () => {
    if (currentStep === 4) {
      onComplete(data);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const updateData = <K extends keyof OnboardingData>(key: K, value: OnboardingData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedLanguageName = LANGUAGE_NAMES[data.language] || "";

  // Render correct step body
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome onNext={nextStep} />;
      case 1:
        return (
          <StepLanguage
            selectedLanguage={data.language}
            onSelectLanguage={(code) => updateData("language", code)}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <StepMotivation
            selectedLanguageName={selectedLanguageName}
            selectedMotivation={data.motivation}
            onSelectMotivation={(id) => updateData("motivation", id)}
            onNext={nextStep}
          />
        );
      case 3:
        return (
          <StepGoal
            selectedGoal={data.dailyGoal}
            onSelectGoal={(minutes) => updateData("dailyGoal", minutes)}
            onNext={nextStep}
          />
        );
      case 4:
        return (
          <StepPath
            selectedLanguageName={selectedLanguageName}
            selectedPath={data.pathSelection}
            onSelectPath={(path) => updateData("pathSelection", path)}
            onNext={nextStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentStep > 0 && (
        <ProgressBar
          progress={currentStep / 4}
          onBack={prevStep}
        />
      )}
      <View style={styles.stepContent}>{renderStepContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  stepContent: {
    flex: 1,
  },
});
