import { Platform } from "react-native";
import { requireOptionalNativeModule } from "expo-modules-core";

type SoundType = "correct_answer" | "wrong_answer" | "level_over";

const sounds: Record<SoundType, any> = {
  correct_answer: require("../../assets/audio/correct_answer.wav"),
  wrong_answer: require("../../assets/audio/wrong_answer.wav"),
  level_over: require("../../assets/audio/level_over.wav"),
};

let Audio: any = null;
let isAudioLoadingFailed = false;

// Bypasses check on Web. On native platforms, check if ExponentAV module exists.
const hasExponentAV = Platform.OS === "web" || (
  typeof requireOptionalNativeModule === "function" && 
  !!requireOptionalNativeModule("ExponentAV")
);

async function getAudio() {
  if (Audio) return Audio;
  if (isAudioLoadingFailed || !hasExponentAV) return null;
  try {
    const expoAv = await import("expo-av");
    Audio = expoAv.Audio;
    return Audio;
  } catch (error) {
    isAudioLoadingFailed = true;
    console.warn("expo-av failed to load. Audio feedback will be disabled.", error);
    return null;
  }
}

export async function playSound(type: SoundType) {
  try {
    const audioLib = await getAudio();
    if (!audioLib) {
      console.warn(`Audio playback disabled. Cannot play sound: ${type}`);
      return;
    }
    const { sound } = await audioLib.Sound.createAsync(sounds[type]);
    await sound.playAsync();
    
    // Automatically unload sound from memory when done playing
    sound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error(`Failed to play sound: ${type}`, error);
  }
}


