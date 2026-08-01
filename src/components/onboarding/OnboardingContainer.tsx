import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/theme";
import ProgressBar from "../ui/ProgressBar";

import StepWelcome from "./StepWelcome";
import StepGoal from "./StepGoal";
import StepPath from "./StepPath";

interface OnboardingData {
  language: string;
  motivation: string;
  dailyGoal: number;
  pathSelection: "beginner" | "placement" | "";
}

interface OnboardingContainerProps {
  onComplete: (data: OnboardingData) => void;
}

export default function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    language: "sanskrit", // Default language to Sanskrit
    motivation: "brain", // Default to brain training
    dailyGoal: 10, // default 10 minutes
    pathSelection: "",
  });

  const nextStep = () => {
    if (currentStep === 2) {
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

  // Render correct step body
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome onNext={nextStep} />;
      case 1:
        return (
          <StepGoal
            selectedGoal={data.dailyGoal}
            onSelectGoal={(minutes) => updateData("dailyGoal", minutes)}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <StepPath
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
          progress={currentStep / 2}
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
