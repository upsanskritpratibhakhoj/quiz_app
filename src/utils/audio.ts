import { createAudioPlayer, setAudioModeAsync } from "expo-audio";

type SoundType = "correct_answer" | "wrong_answer" | "level_over";

const sounds: Record<SoundType, any> = {
  correct_answer: require("../../assets/audio/correct_answer.wav"),
  wrong_answer: require("../../assets/audio/wrong_answer.wav"),
  level_over: require("../../assets/audio/level_over.wav"),
};

let isAudioModeConfigured = false;
const playerCache: Partial<Record<SoundType, any>> = {};

async function configureAudio() {
  if (isAudioModeConfigured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: "mixWithOthers",
    });
    isAudioModeConfigured = true;
  } catch {
    // Ignore if not supported on current platform
  }
}

function getOrCreatePlayer(type: SoundType) {
  if (playerCache[type]) {
    return playerCache[type];
  }
  const source = sounds[type];
  if (!source) return null;

  try {
    const player = createAudioPlayer(source, {
      keepAudioSessionActive: true,
    });
    playerCache[type] = player;
    return player;
  } catch (error) {
    console.warn(`Failed to create audio player for ${type}:`, error);
    return null;
  }
}

export async function playSound(type: SoundType) {
  try {
    await configureAudio();
    let player = getOrCreatePlayer(type);
    if (!player) return;

    try {
      if (player.playing) {
        player.pause();
      }
      await player.seekTo(0);
      player.play();
    } catch {
      // If cached player got into an invalid state, recreate it once
      try {
        if (playerCache[type]) {
          try {
            playerCache[type].remove();
          } catch {
            // ignore
          }
          delete playerCache[type];
        }
        player = getOrCreatePlayer(type);
        if (player) {
          await player.seekTo(0);
          player.play();
        }
      } catch (retryError) {
        console.warn(`Retry failed for sound: ${type}`, retryError);
      }
    }
  } catch (error) {
    console.warn(`Failed to play sound: ${type}`, error);
  }
}





