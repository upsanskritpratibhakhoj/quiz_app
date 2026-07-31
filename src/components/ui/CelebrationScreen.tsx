import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
  Dimensions,
  Pressable,
  GestureResponderEvent,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING, RADII } from "../../constants/theme";
import Mascot from "./Mascot";
import Button from "./Button";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface CelebrationScreenProps {
  score?: number;
  expGained?: number;
  coinsGained?: number;
  onContinue: () => void;
}

// ----------------------------------------------------
// 1. Confetti & Sparkle Items Configuration
// ----------------------------------------------------
const CONFETTI_COLORS = [
  "#ffc800", // Gold / Yellow
  "#a5ed6e", // Lime Green
  "#1cb0f6", // Cyan Blue
  "#ff4b4b", // Vibrant Red
  "#a855f7", // Bright Purple
  "#ff7675", // Coral
  "#00cec9", // Teal
];

const NUM_CONFETTI = 36;

const CONFETTI_ITEMS = Array.from({ length: NUM_CONFETTI }).map((_, i) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const endX = startX + (Math.random() * 120 - 60);
  const size = Math.random() * 10 + 8;
  const isCircle = i % 3 === 0;
  const isRibbon = i % 4 === 0;
  const isStar = i % 5 === 0;
  const isBackground = i % 2 === 0;
  const duration = Math.random() * 2500 + (isBackground ? 3500 : 2500);
  const delay = Math.random() * 1000;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const rotateDirection = i % 2 === 0 ? 1 : -1;

  return {
    id: i,
    startX,
    endX,
    size,
    isCircle,
    isRibbon,
    isStar,
    isBackground,
    duration,
    delay,
    color,
    rotateDirection,
  };
});

interface TapSparkle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function CelebrationScreen({
  score = 100,
  expGained = 20,
  coinsGained = 10,
  onContinue,
}: CelebrationScreenProps) {
  // ----------------------------------------------------
  // 2. Animated Values for Multi-Phase Entrance
  // ----------------------------------------------------
  const [sunburstRotation] = useState(() => new Animated.Value(0));
  const [shockwaveScale] = useState(() => new Animated.Value(0));
  const [shockwaveOpacity] = useState(() => new Animated.Value(1));

  // Phase 1: Medallion
  const [medallionScale] = useState(() => new Animated.Value(0));
  const [medallionRotate] = useState(() => new Animated.Value(-15));

  // Phase 2: Mascot & Speech Bubble
  const [mascotScale] = useState(() => new Animated.Value(0));
  const [mascotTranslateY] = useState(() => new Animated.Value(30));
  const [speechBubbleScale] = useState(() => new Animated.Value(0));

  // Phase 3: Roll-up Stat Counters
  const [displayScore, setDisplayScore] = useState(0);
  const [displayExp, setDisplayExp] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [cardScale] = useState(() => new Animated.Value(0.8));
  const [cardOpacity] = useState(() => new Animated.Value(0));

  // Phase 4: CTA Button
  const [buttonScale] = useState(() => new Animated.Value(0.85));
  const [buttonOpacity] = useState(() => new Animated.Value(0));

  // Interactive Tap Sparkles
  const [tapSparkles, setTapSparkles] = useState<TapSparkle[]>([]);

  // Confetti Animations
  const [confettiAnims] = useState(() =>
    CONFETTI_ITEMS.map(() => new Animated.Value(0))
  );

  // ----------------------------------------------------
  // 3. Multi-Phase Entrance Effect
  // ----------------------------------------------------
  useEffect(() => {
    // A. Sunburst Rotation Loop (Continuous 360)
    Animated.loop(
      Animated.timing(sunburstRotation, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // B. Shockwave Burst
    Animated.parallel([
      Animated.timing(shockwaveScale, {
        toValue: 2.5,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(shockwaveOpacity, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // C. Phase 1: Medallion Drop with Bounce
    Animated.parallel([
      Animated.spring(medallionScale, {
        toValue: 1,
        friction: 4,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.spring(medallionRotate, {
        toValue: 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // D. Phase 2: Mascot & Speech Bubble Entrance (after 300ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(mascotScale, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(mascotTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Speech Bubble Spring
        Animated.spring(speechBubbleScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }).start();

        // Continuous Mascot Bounce
        Animated.loop(
          Animated.sequence([
            Animated.timing(mascotTranslateY, {
              toValue: -12,
              duration: 450,
              easing: Easing.ease,
              useNativeDriver: true,
            }),
            Animated.timing(mascotTranslateY, {
              toValue: 0,
              duration: 450,
              easing: Easing.bounce,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }, 300);

    // E. Phase 3: Stat Cards & Numeric Roll-up (after 800ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 6,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();

      // Numerical Roll-up Counters
      let startScore = 0;
      let startExp = 0;
      let startCoins = 0;
      const steps = 20;
      const interval = 40; // 800ms total duration

      const timer = setInterval(() => {
        startScore = Math.min(score, startScore + Math.ceil(score / steps));
        startExp = Math.min(expGained, startExp + Math.ceil(expGained / steps));
        startCoins = Math.min(
          coinsGained,
          startCoins + Math.ceil(coinsGained / steps)
        );

        setDisplayScore(startScore);
        setDisplayExp(startExp);
        setDisplayCoins(startCoins);

        if (
          startScore >= score &&
          startExp >= expGained &&
          startCoins >= coinsGained
        ) {
          clearInterval(timer);
        }
      }, interval);
    }, 800);

    // F. Phase 4: Button Reveal (after 1400ms)
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1400);

    // G. Confetti Particle Loops
    confettiAnims.forEach((anim, idx) => {
      const item = CONFETTI_ITEMS[idx];
      const runConfetti = () => {
        anim.setValue(0);
        Animated.timing(anim, {
          toValue: 1,
          duration: item.duration,
          delay: item.delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => runConfetti());
      };
      runConfetti();
    });
  }, []);

  // ----------------------------------------------------
  // 4. Interactive Touch Sparkle Handler
  // ----------------------------------------------------
  const handleTouchScreen = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const newSparkles: TapSparkle[] = Array.from({ length: 5 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: pageX + (Math.random() * 40 - 20),
      y: pageY + (Math.random() * 40 - 20),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 12 + 10,
    }));

    setTapSparkles((prev) => [...prev.slice(-15), ...newSparkles]);
  };

  const sunburstInterpolate = sunburstRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const medallionRotateInterpolate = medallionRotate.interpolate({
    inputRange: [-15, 0],
    outputRange: ["-15deg", "0deg"],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={styles.touchableContainer} onPress={handleTouchScreen}>
        {/* Background Sunburst Light Rays Layer */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sunburstContainer,
            { transform: [{ rotate: sunburstInterpolate }] },
          ]}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.sunburstRay,
                { transform: [{ rotate: `${i * 30}deg` }] },
              ]}
            />
          ))}
        </Animated.View>

        {/* Central Shockwave Ring */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shockwaveRing,
            {
              opacity: shockwaveOpacity,
              transform: [{ scale: shockwaveScale }],
            },
          ]}
        />

        {/* Confetti Background Layer (Depth) */}
        {CONFETTI_ITEMS.filter((item) => item.isBackground).map((item, idx) => {
          const anim = confettiAnims[idx];
          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [-40, SCREEN_HEIGHT + 40],
          });
          const translateX = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [item.startX, item.endX],
          });
          const rotate = anim.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", `${item.rotateDirection * 360}deg`],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.1, 0.8, 1],
            outputRange: [0, 0.45, 0.45, 0],
          });

          return (
            <Animated.View
              key={`bg-${item.id}`}
              pointerEvents="none"
              style={[
                styles.confettiPiece,
                {
                  width: item.size,
                  height: item.size,
                  borderRadius: item.isCircle ? item.size / 2 : 2,
                  backgroundColor: item.color,
                  opacity,
                  transform: [{ translateX }, { translateY }, { rotate }],
                },
              ]}
            />
          );
        })}

        {/* Main Victory Header - 3D Vector Medallion */}
        <Animated.View
          style={[
            styles.medallionWrapper,
            {
              transform: [
                { scale: medallionScale },
                { rotate: medallionRotateInterpolate },
              ],
            },
          ]}
        >
          <View style={styles.medallionOuterRing}>
            <View style={styles.medallionInnerCircle}>
              <Text style={styles.medallionStarIcon}>⭐</Text>
              <Text style={styles.medallionTitleText}>PERFECT</Text>
              <Text style={styles.medallionScoreText}>100%</Text>
            </View>
            {/* Ribbon Banner */}
            <View style={styles.ribbonBanner}>
              <Text style={styles.ribbonBannerText}>पूर्णता विजय (100%)</Text>
            </View>
          </View>
        </Animated.View>

        {/* Mascot & Sanskrit Victory Speech Bubble */}
        <View style={styles.mascotSection}>
          <Animated.View
            style={[
              styles.mascotWrapper,
              {
                transform: [
                  { scale: mascotScale },
                  { translateY: mascotTranslateY },
                ],
              },
            ]}
          >
            <Mascot expression="excited" size={140} />
          </Animated.View>

          {/* Dynamic Speech Bubble */}
          <Animated.View
            style={[
              styles.speechBubble,
              {
                transform: [{ scale: speechBubbleScale }],
              },
            ]}
          >
            <View style={styles.speechArrow} />
            <Text style={styles.speechTitle}>अद्‌भुतम्! शतप्रतिशतम्! 🌟</Text>
            <Text style={styles.speechSubtitle}>
              आपने सभी प्रश्नों के सही उत्तर दिए!
            </Text>
          </Animated.View>
        </View>

        {/* Rolling Numeric Stat Reward Cards */}
        <Animated.View
          style={[
            styles.statsRow,
            {
              opacity: cardOpacity,
              transform: [{ scale: cardScale }],
            },
          ]}
        >
          {/* Accuracy Card */}
          <View style={[styles.statCard, styles.accuracyCardBorder]}>
            <View style={[styles.cardBadgeHeader, { backgroundColor: "#fff8d6" }]}>
              <Text style={styles.cardHeaderIcon}>🎯</Text>
            </View>
            <Text style={styles.cardValueText}>{displayScore}%</Text>
            <Text style={styles.cardLabelText}>सटीकता</Text>
          </View>

          {/* XP Card */}
          <View style={[styles.statCard, styles.xpCardBorder]}>
            <View style={[styles.cardBadgeHeader, { backgroundColor: "#eefdff" }]}>
              <Text style={styles.cardHeaderIcon}>⚡</Text>
            </View>
            <Text style={styles.cardValueText}>+{displayExp}</Text>
            <Text style={styles.cardLabelText}>EXP बोनस</Text>
          </View>

          {/* Coins Card */}
          <View style={[styles.statCard, styles.coinCardBorder]}>
            <View style={[styles.cardBadgeHeader, { backgroundColor: "#fff5ea" }]}>
              <Text style={styles.cardHeaderIcon}>🪙</Text>
            </View>
            <Text style={styles.cardValueText}>+{displayCoins}</Text>
            <Text style={styles.cardLabelText}>सिक्के</Text>
          </View>
        </Animated.View>

        {/* Interactive Touch Sparkles Overlay */}
        {tapSparkles.map((sparkle) => (
          <View
            key={sparkle.id}
            pointerEvents="none"
            style={[
              styles.tapSparkle,
              {
                left: sparkle.x - sparkle.size / 2,
                top: sparkle.y - sparkle.size / 2,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: sparkle.color,
                borderRadius: sparkle.size / 2,
              },
            ]}
          >
            <Text style={{ fontSize: 10 }}>✨</Text>
          </View>
        ))}

        {/* Confetti Foreground Layer */}
        {CONFETTI_ITEMS.filter((item) => !item.isBackground).map((item, idx) => {
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
            outputRange: ["0deg", `${item.rotateDirection * 720}deg`],
          });
          const opacity = anim.interpolate({
            inputRange: [0, 0.1, 0.85, 1],
            outputRange: [0, 1, 1, 0],
          });

          return (
            <Animated.View
              key={`fg-${item.id}`}
              pointerEvents="none"
              style={[
                styles.confettiPiece,
                {
                  width: item.isRibbon ? item.size * 0.35 : item.size,
                  height: item.size,
                  borderRadius: item.isCircle ? item.size / 2 : 3,
                  backgroundColor: item.color,
                  opacity,
                  transform: [{ translateX }, { translateY }, { rotate }],
                },
              ]}
            />
          );
        })}

        {/* Footer 3D Duolingo CTA Button */}
        <Animated.View
          style={[
            styles.footerContainer,
            {
              opacity: buttonOpacity,
              transform: [{ scale: buttonScale }],
            },
          ]}
        >
          <Button
            title="आगे बढ़ें (Continue)"
            onPress={onContinue}
            variant="primary"
            style={styles.ctaButton}
          />
        </Animated.View>
      </Pressable>
    </SafeAreaView>
  );
}

// ----------------------------------------------------
// 5. Duolingo-Styled Premium Victory Styles
// ----------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ddf4ff", // Soft pale blue
  },
  touchableContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },

  /* Sunburst Rotating Background */
  sunburstContainer: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.1,
    width: 600,
    height: 600,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  sunburstRay: {
    position: "absolute",
    width: 600,
    height: 40,
    backgroundColor: "rgba(255, 235, 150, 0.35)",
    borderRadius: 20,
  },

  /* Shockwave Burst */
  shockwaveRing: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.22,
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: "#ffc800",
    zIndex: 0,
  },

  /* 3D Vector Medallion */
  medallionWrapper: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  medallionOuterRing: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ffc800",
    borderWidth: 6,
    borderColor: "#e6a100",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.25)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
    }),
    elevation: 8,
    position: "relative",
  },
  medallionInnerCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#ffffff",
    borderWidth: 4,
    borderColor: "#ffda47",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 12,
  },
  medallionStarIcon: {
    fontSize: 22,
    marginBottom: -2,
  },
  medallionTitleText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#e6a100",
    letterSpacing: 1.2,
    textAlign: "center",
  },
  medallionScoreText: {
    fontSize: 28,
    fontWeight: "900",
    color: COLORS.text,
    marginTop: -2,
    textAlign: "center",
  },
  ribbonBanner: {
    position: "absolute",
    bottom: -14,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#a5ed6e",
    borderWidth: 3,
    borderColor: "#78ca28",
    borderRadius: RADII.md,
    paddingHorizontal: 16,
    paddingVertical: 5,
    ...Platform.select({
      web: {
        boxShadow: "0px 3px 4px rgba(0, 0, 0, 0.2)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
    elevation: 4,
  },
  ribbonBannerText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#111111",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  /* Mascot & Speech Bubble */
  mascotSection: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    zIndex: 3,
    marginVertical: 10,
  },
  mascotWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  speechBubble: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: COLORS.accent,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
    ...Platform.select({
      web: {
        boxShadow: "0px 3px 4px rgba(0, 0, 0, 0.12)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 4,
      },
    }),
    elevation: 3,
    position: "relative",
  },
  speechArrow: {
    position: "absolute",
    top: -10,
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.accent,
  },
  speechTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  speechSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  /* Rolling Stat Cards */
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    zIndex: 3,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginHorizontal: 4,
    alignItems: "center",
    ...Platform.select({
      web: {
        boxShadow: "0px 4px 5px rgba(0, 0, 0, 0.1)",
      },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
    }),
    elevation: 4,
  },
  accuracyCardBorder: {
    borderColor: "#ffc800",
  },
  xpCardBorder: {
    borderColor: COLORS.primary,
  },
  coinCardBorder: {
    borderColor: COLORS.accent,
  },
  cardBadgeHeader: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  cardHeaderIcon: {
    fontSize: 18,
  },
  cardValueText: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.text,
  },
  cardLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginTop: 2,
  },

  /* Interactive Sparkles & Confetti */
  tapSparkle: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  confettiPiece: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },

  /* Footer Button */
  footerContainer: {
    width: "100%",
    zIndex: 4,
    marginBottom: 5,
  },
  ctaButton: {
    width: "100%",
  },
});
