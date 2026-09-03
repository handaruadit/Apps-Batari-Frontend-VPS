//===== (Imports) ======
import SolarIcon from "@/components/SolarIcon";
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";

//===== (BottomGapCover) ======
function BottomGapCover({ screenColor, height }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: height,
        backgroundColor: screenColor,
        zIndex: 5,
      }}
    />
  );
}

//===== (HomeLayout) ======
export default function MainLayout() {
  const { colors, t, themeMode } = useAppSettings();
  const { width, height } = useWindowDimensions();
  const isLight = themeMode === "light";

  //===== (Responsive Tab Metrics) ======
  const isSmallScreen = width < 380;
  const isShortScreen = height < 720;

  const maxTabBarWidth = 480;
  const tabHorizontalMargin = Math.max(
    isSmallScreen ? 18 : 24,
    (width - maxTabBarWidth) / 2,
  );
  const tabBottom = isShortScreen ? 12 : 16;
  const tabHeight = isSmallScreen ? 60 : 64;
  const tabRadius = 22;

  const iconSize = isSmallScreen ? 26 : 28;
  const solarIconSize = isSmallScreen ? 30 : 34;
  const iconBoxSize = isSmallScreen ? 30 : 34;

  const pillBg = isLight ? "#FFFFFF" : colors.bubble || "#151F30";
  const pillBorder = isLight
    ? "rgba(24, 174, 230, 0.45)"
    : colors.accent || "#00AEEF";

  // Height of the cover beneath the floating pill
  const bottomCoverHeight = tabBottom + 10;

  //===== (Render) ======
  return (
    <View style={{ flex: 1, backgroundColor: colors.screen }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          sceneStyle: { backgroundColor: colors.screen },

          tabBarStyle: {
            position: "absolute",
            left: tabHorizontalMargin,
            right: tabHorizontalMargin,
            bottom: tabBottom,
            height: tabHeight,
            backgroundColor: pillBg,
            borderRadius: tabRadius,
            overflow: "hidden",
            paddingHorizontal: 0,
            paddingTop: 8,
            paddingBottom: 8,
            borderTopWidth: 0,
            borderWidth: 1.5,
            borderColor: pillBorder,
            shadowColor: colors.accent || "#00AEEF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 12,
            zIndex: 10,
          },

          tabBarBackground: () => (
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: pillBg,
                borderRadius: tabRadius,
              }}
            />
          ),

          tabBarActiveTintColor: "#2F80FF",
          tabBarInactiveTintColor: colors.textMuted,
          tabBarActiveBackgroundColor: "transparent",
          tabBarInactiveBackgroundColor: "transparent",

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
            marginBottom: 4,
          },

          tabBarItemStyle: {
            flex: 1,
            height: tabHeight - 16,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 0,
          },

          tabBarIconStyle: {
            width: 32,
            height: 32,
            marginTop: 0,
            marginBottom: 0,
          },
        }}
      >
        <Tabs.Screen
          name="plant"
          options={{
            title: "Plant",
            tabBarIcon: ({ color }) => (
              <View
                style={{
                  width: iconBoxSize,
                  height: iconBoxSize,
                  justifyContent: "center",
                  alignItems: "center",
                  transform: [{ translateY: 5 }],
                }}
              >
                <SolarIcon color={color} size={solarIconSize} />
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="me"
          options={{
            title: t("me"),
            tabBarIcon: ({ color }) => (
              <View
                style={{
                  width: iconBoxSize,
                  height: iconBoxSize,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="person-outline" size={iconSize} color={color} />
              </View>
            ),
          }}
        />
      </Tabs>

      {/* Solid background covering ONLY the small gap beneath the floating tab bar */}
      <BottomGapCover
        screenColor={colors.screen}
        height={bottomCoverHeight}
      />
    </View>
  );
}
