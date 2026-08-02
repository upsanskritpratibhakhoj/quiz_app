import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, View, Image } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameProvider } from "../context/GameContext";

// Prevent the native splash screen from auto-hiding before we're ready
SplashScreen.preventAutoHideAsync().catch(() => {
  /* Prevent crash on reload */
});

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [fadeAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Wait for the app to be ready (e.g., 1.5 seconds to show the logo)
    const prepare = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    };
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      const hideNativeAndFade = async () => {
        try {
          // Hide native splash screen
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn(e);
        }

        // Start fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          setShowSplash(false);
        });
      };

      hideNativeAndFade();
    }
  }, [appIsReady, fadeAnim]);

  return (
    <SafeAreaProvider>
      <GameProvider>
        <View style={styles.container}>
          <Stack
            screenOptions={{
              headerShown: false,
            }}
          />
          {showSplash && (
            <Animated.View
              style={[
                styles.splashContainer,
                {
                  opacity: fadeAnim,
                },
              ]}
              pointerEvents="none"
            >
              <Image
                source={require("../../assets/images/splash_screen.png")}
                style={styles.splashImage}
                resizeMode="cover"
              />
            </Animated.View>
          )}
        </View>
      </GameProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FEF2DD",
    zIndex: 9999,
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
});

