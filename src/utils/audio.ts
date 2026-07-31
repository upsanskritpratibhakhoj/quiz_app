import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";

type SoundType = "correct_answer" | "wrong_answer" | "level_over";

const sounds: Record<SoundType, any> = {
  correct_answer: require("../../assets/audio/correct_answer.wav"),
  wrong_answer: require("../../assets/audio/wrong_answer.wav"),
  level_over: require("../../assets/audio/level_over.wav"),
};

let expoAudioLib: any = null;
let isAudioLoadingFailed = false;

// Bypasses check on Web. On native platforms, check if ExpoAudio module exists.
const hasExpoAudio = Platform.OS === "web" || (
  typeof requireOptionalNativeModule === "function" && 
  !!requireOptionalNativeModule("ExpoAudio")
);

async function getExpoAudio() {
  if (expoAudioLib) return expoAudioLib;
  if (isAudioLoadingFailed || !hasExpoAudio) return null;
  try {
    const lib = await import("expo-audio");
    expoAudioLib = lib;
    return expoAudioLib;
  } catch (error) {
    isAudioLoadingFailed = true;
    console.warn("expo-audio failed to load. Audio feedback will be disabled.", error);
    return null;
  }
}

export async function playSound(type: SoundType) {
  try {
    const audioLib = await getExpoAudio();
    if (!audioLib) {
      console.warn(`Audio playback disabled. Cannot play sound: ${type}`);
      return;
    }
    const player = audioLib.createAudioPlayer(sounds[type]);
    const subscription = player.addListener("playbackStatusUpdate", (status: any) => {
      if (status.didJustFinish) {
        subscription.remove();
        player.remove();
      }
    });
    player.play();
  } catch (error) {
    console.error(`Failed to play sound: ${type}`, error);
  }
}



