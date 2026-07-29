import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { COLORS, TYPOGRAPHY, SPACING, RADII } from "../../constants/theme";
import Mascot from "./Mascot";
import Button from "./Button";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CelebrationScreenProps {
  score: number;
  expGained?: number;
  coinsGained?: number;
  onContinue: () => void;
}

// Generate deterministic confetti items with varied shapes, positions & colors
const CONFETTI_COLORS = [
  "#ffc800", // Gold / Yellow
  "#a5ed6e", // Lime Green
  "#1cb0f6", // Cyan Blue
  "#ff4b4b", // Vibrant Red
  "#a855f7", // Bright Purple
  "#ff7675", // Coral
  "#55efc4", // Mint
];

const NUM_CONFETTI = 30;

const CONFETTI_ITEMS = Array.from({ length: NUM_CONFETTI }).map((_, i) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() * 80 - 40);
  const size = Math.random() * 10 + 8;
  const isCircle = i % 3 === 0;
  const isRibbon = i % 4 === 0;
  const duration = Math.random() * 2500 + 2500; // 2.5s to 5s
  const delay = Math.random() * 1200;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const rotateDirection = i % 2 === 0 ? 1 : -1;

  return {
    id: i,
    startX,
    endX,
    size,
    isCircle,
    isRibbon,
    duration,
    delay,
    color,
    rotateDirection,
  };
});

export default function CelebrationScreen({
  score = 100,
  expGained = 20,
  coinsGained = 10,
  onContinue,
}: CelebrationScreenProps) {
  // Animation values
  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyGlow = useRef(new Animated.Value(0)).current;
  const mascotTranslateY = useRef(new Animated.Value(40)).current;
  const mascotScale = useRef(new Animated.Value(0.8)).current;
  const bannerScale = useRef(new Animated.Value(0)).current;
  const cardsTranslateY = useRef(new Animated.Value(60)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.9)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  // Confetti animated values
  const confettiAnims = useRef(
    CONFETTI_ITEMS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // 1. Trophy Pop & Glow
    Animated.sequence([
      Animated.spring(trophyScale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyGlow, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(trophyGlow, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // 2. Banner & Title Pop
    Animated.spring(bannerScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      delay: 200,
      useNativeDriver: true,
    }).start();

    // 3. Mascot Bounce Loop
    Animated.parallel([
      Animated.spring(mascotScale, {
        toValue: 1,
        friction: 5,
        tension: 90,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(mascotTranslateY, {
        toValue: 0,
        duration: 400,
        delay: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Continuous joyful bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotTranslateY, {
            toValue: -15,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(mascotTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // 4. Reward Cards Slide-up
    Animated.parallel([
      Animated.timing(cardsTranslateY, {
        toValue: 0,
        duration: 500,
        delay: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(cardsOpacity, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 5. Button Entrance
    Animated.parallel([
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 6,
        tension: 100,
        delay: 700,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 400,
        delay: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // 6. Confetti falling loops
    confettiAnims.forEach((anim, idx) => {
      const item = CONFETTI_ITEMS[idx];
      const startConfetti = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: item.duration,
          delay: item.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => startConfetti());
      };
      startConfetti();
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Background Radial Light Glow */}
        <Animated.View
          style={[
            styles.glowContainer,
            {
              opacity: trophyGlow,
              transform: [{ scale: trophyGlow.interpolate({ inputRange: [0.3, 1], outputRange: [0.9, 1.15] }) }],
            },
          ]}
        >
          <View style={styles.radialGlow} />
        </Animated.View>

        {/* Floating Confetti Particles Layer */}
        {CONFETTI_ITEMS.map((item, idx) => {
          const anim = confettiAnims[idx];
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-30, SCREEN_HEIGHT + 30],
          });
          const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [item.startX, item.endX],
          });
          const rotate = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [
              "0deg",
              `${item.rotateDirection * 720}deg`,
            ],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.1, 0.85, 1],
            outputRange: [0, 1, 1, 0],
          });

          return (
            <Animated.View
              key={item.id}
              pointerEvents="none"
              style={[
                styles.confettiPiece,
                {
                  width: item.isRibbon ? item.size * 0.4 : item.size,
                  height: item.size,
                  borderRadius: item.isCircle ? item.size / 2 : item.isRibbon ? 2 : 3,
                  backgroundColor: item.color,
                  opacity,
                  transform: [{ translateX }, { translateY }, { rotate }],
                },
              ]}
            />
          );
        })}

        {/* Header Victory Crown & Trophy */}
        <Animated.View
          style={[
            styles.trophyWrapper,
            {
              transform: [{ scale: trophyScale }],
            },
          ]}
        >
          <View style={styles.trophyBadge}>
            <Text style={styles.trophyEmoji}>🏆</Text>
            <View style={styles.perfectionBadge}>
              <Text style={styles.perfectionText}>100% PERFECT</Text>
            </View>
          </View>
        </Animated.View>

        {/* Title Banner */}
        <Animated.View
          style={[
            styles.bannerContainer,
            {
              transform: [{ scale: bannerScale }],
            },
          ]}
        >
          <Text style={styles.victoryTitle}>सर्वोत्कृष्टम्! 🎉</Text>
          <Text style={styles.victorySubtitle}>
            अद्भुत कार्य! आपने शत-प्रतिशत (100%) अंक प्राप्त करके संपूर्ण विजय हासिल की!
          </Text>
        </Animated.View>

        {/* Mascot Joyful Animation */}
        <Animated.View
          style={[
            styles.mascotContainer,
            {
              transform: [
                { translateY: mascotTranslateY },
                { scale: mascotScale },
              ],
            },
          ]}
        >
          <Mascot expression="excited" size={150} />
          {/* Sparkle Emojis around Mascot */}
          <Text style={[styles.sparkle, styles.sparkleLeft]}>✨</Text>
          <Text style={[styles.sparkle, styles.sparkleRight]}>🌟</Text>
        </Animated.View>

        {/* Rewards Row (Bonus XP & Coins for 100% Score) */}
        <Animated.View
          style={[
            styles.rewardsRow,
            {
              opacity: cardsOpacity,
              transform: [{ translateY: cardsTranslateY }],
            },
          ]}
        >
          <View style={[styles.rewardCard, styles.goldCard]}>
            <Text style={styles.rewardIcon}>🎯</Text>
            <Text style={styles.rewardValue}>100%</Text>
            <Text style={styles.rewardLabel}>सटीकता (Score)</Text>
          </View>

          <View style={[styles.rewardCard, styles.xpCard]}>
            <Text style={styles.rewardIcon}>⚡</Text>
            <Text style={styles.rewardValue}>+{expGained} EXP</Text>
            <Text style={styles.rewardLabel}>बोनस अनुभव</Text>
          </View>

          <View style={[styles.rewardCard, styles.coinCard]}>
            <Text style={styles.rewardIcon}>🪙</Text>
            <Text style={styles.rewardValue}>+{coinsGained} Coins</Text>
            <Text style={styles.rewardLabel}>बोनस सिक्के</Text>
          </View>
        </Animated.View>

        {/* Action Button */}
        <Animated.View
          style={[
            styles.buttonWrapper,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Button
            title="उत्कृष्टम्! (Continue)"
            onPress={onContinue}
            variant="primary"
            style={styles.ctaButton}
          />
        </Animated.View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    overflow: "hidden",
  },
  glowContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.15,
    alignSelf: "center",
    width: 300,
    height: 300,
    borderRadius: 150,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  radialGlow: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#fff0a6",
    opacity: 0.6,
    shadowColor: "#ffc800",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
    elevation: 20,
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  trophyWrapper: {
    marginTop: SPACING.sm,
    alignItems: "center",
    zIndex: 2,
  },
  trophyBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  trophyEmoji: {
    fontSize: 64,
    textShadowColor: "rgba(255, 200, 0, 0.6)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  perfectionBadge: {
    backgroundColor: "#ffc800",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: RADII.md,
    marginTop: -8,
    borderWidth: 2,
    borderColor: "#e6a100",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  perfectionText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 1,
  },
  bannerContainer: {
    alignItems: "center",
    marginHorizontal: SPACING.md,
    zIndex: 2,
  },
  victoryTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 6,
  },
  victorySubtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 21,
  },
  mascotContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    zIndex: 2,
  },
  sparkle: {
    position: "absolute",
    fontSize: 28,
  },
  sparkleLeft: {
    top: 10,
    left: -20,
  },
  sparkleRight: {
    bottom: 20,
    right: -20,
  },
  rewardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: SPACING.sm,
    zIndex: 2,
  },
  rewardCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: RADII.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: "rgb(128, 128, 128)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  goldCard: {
    borderColor: "#ffc800",
    backgroundColor: "#fffdf0",
  },
  xpCard: {
    borderColor: COLORS.primary,
    backgroundColor: "#f4fdf0",
  },
  coinCard: {
    borderColor: COLORS.accent,
    backgroundColor: "#f0f9ff",
  },
  rewardIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
  },
  rewardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: 2,
  },
  buttonWrapper: {
    width: "100%",
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.sm,
    zIndex: 2,
  },
  ctaButton: {
    width: "100%",
  },
});
