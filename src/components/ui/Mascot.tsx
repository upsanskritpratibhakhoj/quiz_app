import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { COLORS } from "../../constants/theme";

interface MascotProps {
  expression?: "happy" | "excited" | "guiding";
  size?: number;
  style?: ViewStyle;
}

export default function Mascot({
  expression = "happy",
  size = 140,
  style,
}: MascotProps) {
  const scale = size / 140;

  // Render happy eyes (circular with shiny pupils)
  const renderHappyEyes = () => (
    <View style={styles.eyesRow}>
      {/* Left Eye */}
      <View style={[styles.eyeOuter, { transform: [{ scale }] }]}>
        <View style={styles.pupil}>
          <View style={styles.reflection} />
        </View>
      </View>
      {/* Right Eye */}
      <View style={[styles.eyeOuter, { transform: [{ scale }] }]}>
        <View style={styles.pupil}>
          <View style={styles.reflection} />
        </View>
      </View>
    </View>
  );

  // Render excited eyes (closed arches ^^)
  const renderExcitedEyes = () => (
    <View style={styles.eyesRow}>
      {/* Left Eye Arch */}
      <View style={[styles.excitedEyeContainer, { transform: [{ scale }] }]}>
        <View style={styles.excitedEyeArch} />
      </View>
      {/* Right Eye Arch */}
      <View style={[styles.excitedEyeContainer, { transform: [{ scale }] }]}>
        <View style={styles.excitedEyeArch} />
      </View>
    </View>
  );

  // Render guiding/winking or side-looking eyes
  const renderGuidingEyes = () => (
    <View style={styles.eyesRow}>
      {/* Left Eye looking right */}
      <View style={[styles.eyeOuter, { transform: [{ scale }] }]}>
        <View style={[styles.pupil, { right: -2, left: undefined }]}>
          <View style={styles.reflection} />
        </View>
      </View>
      {/* Right Eye looking right */}
      <View style={[styles.eyeOuter, { transform: [{ scale }] }]}>
        <View style={[styles.pupil, { right: -2, left: undefined }]}>
          <View style={styles.reflection} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Ears / Horns */}
      <View style={[styles.earLeft, { transform: [{ scale }, { rotate: "-15deg" }] }]} />
      <View style={[styles.earRight, { transform: [{ scale }, { rotate: "15deg" }] }]} />

      {/* Main Body */}
      <View style={[styles.body, { width: size, height: size * 0.95 }]}>
        
        {/* Belly Plume */}
        <View style={styles.belly}>
          {/* Chevron Marks */}
          <View style={styles.chevronRow}>
            <View style={styles.chevron} />
            <View style={styles.chevron} />
          </View>
          <View style={[styles.chevronRow, { marginTop: 4 }]}>
            <View style={[styles.chevron, { marginHorizontal: 2 }]} />
          </View>
        </View>

        {/* Eyes Row */}
        {expression === "happy" && renderHappyEyes()}
        {expression === "excited" && renderExcitedEyes()}
        {expression === "guiding" && renderGuidingEyes()}

        {/* Beak */}
        <View style={[styles.beak, { transform: [{ scale }] }]} />

        {/* Cheeks */}
        <View style={styles.cheeksRow}>
          <View style={[styles.cheek, { opacity: expression === "excited" ? 0.8 : 0.4 }]} />
          <View style={[styles.cheek, { opacity: expression === "excited" ? 0.8 : 0.4 }]} />
        </View>
      </View>

      {/* Wings */}
      {expression === "excited" ? (
        <>
          {/* Wings up */}
          <View style={[styles.wingLeftExcited, { transform: [{ scale }] }]} />
          <View style={[styles.wingRightExcited, { transform: [{ scale }] }]} />
        </>
      ) : expression === "guiding" ? (
        <>
          {/* Guiding: Left wing resting, Right wing pointing out */}
          <View style={[styles.wingLeft, { transform: [{ scale }] }]} />
          <View style={[styles.wingRightGuiding, { transform: [{ scale }, { rotate: "35deg" }] }]} />
        </>
      ) : (
        <>
          {/* Default Happy: Wings resting */}
          <View style={[styles.wingLeft, { transform: [{ scale }] }]} />
          <View style={[styles.wingRight, { transform: [{ scale }] }]} />
        </>
      )}

      {/* Feet */}
      <View style={styles.feetRow}>
        <View style={[styles.foot, { transform: [{ scale }] }]} />
        <View style={[styles.foot, { transform: [{ scale }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    backgroundColor: COLORS.primary,
    borderRadius: 65,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  earLeft: {
    position: "absolute",
    top: 5,
    left: 8,
    width: 35,
    height: 35,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 15,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    zIndex: 1,
  },
  earRight: {
    position: "absolute",
    top: 5,
    right: 8,
    width: 35,
    height: 35,
    backgroundColor: COLORS.primary,
    borderTopRightRadius: 15,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    zIndex: 1,
  },
  belly: {
    position: "absolute",
    bottom: -10,
    width: "75%",
    height: "50%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    alignItems: "center",
    paddingTop: 10,
  },
  chevronRow: {
    flexDirection: "row",
  },
  chevron: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.primaryDark,
    marginHorizontal: 4,
  },
  eyesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    position: "absolute",
    top: "22%",
    zIndex: 3,
  },
  eyeOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 3,
    borderColor: COLORS.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },
  pupil: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.onPrimary,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  reflection: {
    position: "absolute",
    top: 2,
    left: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ffffff",
  },
  excitedEyeContainer: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  excitedEyeArch: {
    width: 26,
    height: 14,
    borderTopWidth: 5,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: COLORS.primaryDark,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: "transparent",
  },
  beak: {
    width: 0,
    height: 0,
    borderStyle: "solid",
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: COLORS.warning,
    position: "absolute",
    top: "43%",
    zIndex: 4,
    shadowColor: COLORS.warningDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cheeksRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    position: "absolute",
    top: "47%",
    zIndex: 3,
  },
  cheek: {
    width: 14,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff7b7b",
    marginHorizontal: 5,
  },
  wingLeft: {
    position: "absolute",
    left: -14,
    top: "35%",
    width: 20,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    zIndex: 1,
  },
  wingRight: {
    position: "absolute",
    right: -14,
    top: "35%",
    width: 20,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    zIndex: 1,
  },
  wingLeftExcited: {
    position: "absolute",
    left: -16,
    top: "20%",
    width: 22,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    transform: [{ rotate: "30deg" }],
    zIndex: 1,
  },
  wingRightExcited: {
    position: "absolute",
    right: -16,
    top: "20%",
    width: 22,
    height: 45,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    transform: [{ rotate: "-30deg" }],
    zIndex: 1,
  },
  wingRightGuiding: {
    position: "absolute",
    right: -18,
    top: "32%",
    width: 45,
    height: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    zIndex: 1,
  },
  feetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "45%",
    position: "absolute",
    bottom: -6,
    zIndex: 1,
  },
  foot: {
    width: 22,
    height: 12,
    backgroundColor: COLORS.warning,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: COLORS.warningDark,
  },
});
