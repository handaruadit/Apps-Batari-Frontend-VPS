//===== (Imports) ======
import { appColors } from "@/config/theme";
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";

//===== (Hidden Screens) ======
const hiddenScreens = [
  "Add-device",
  "manage-access",
  "qr-scanner",
];

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

//===== (Plant Detail Layout) ======
export default function PlantDetailLayout() {
  const { colors, themeMode } = useAppSettings();
  const isLightMode = themeMode === "light";
  const { width } = useWindowDimensions();
  const maxTabBarWidth = 480;
  const tabHorizontalMargin = Math.max(24, (width - maxTabBarWidth) / 2);

  const screenColor = isLightMode ? colors.screen : appColors.screen;
  const pillBg = isLightMode ? "#FFFFFF" : colors.bubble || appColors.bubble;
  const pillBorder = isLightMode
    ? "rgba(24, 174, 230, 0.45)"
    : "rgba(0, 170, 255, 0.55)";

  const bottomCoverHeight = 26;

  return (
    <View style={{ flex: 1, backgroundColor: screenColor }}>
      <Tabs
        backBehavior="none"
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          sceneStyle: { backgroundColor: screenColor },

          tabBarStyle: {
            position: "absolute",
            left: tabHorizontalMargin,
            right: tabHorizontalMargin,
            bottom: 16,
            height: 64,
            paddingHorizontal: 0,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: pillBg,
            borderRadius: 22,
            overflow: "hidden",
            borderTopWidth: 0,
            borderWidth: 1.5,
            borderColor: pillBorder,
            shadowColor: isLightMode ? colors.accent : "#00AEEF",
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
                borderRadius: 22,
              }}
            />
          ),

          tabBarItemStyle: {
            flex: 1,
            height: 48,
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 0,
          },

          tabBarIconStyle: {
            width: 32,
            height: 32,
            marginTop: 0,
            marginBottom: 0,
          },

          tabBarActiveTintColor: "#2F80FF",
          tabBarInactiveTintColor: isLightMode
            ? colors.textMuted
            : "rgba(255,255,255,0.65)",
        }}
      >
        <Tabs.Screen
          name="overview"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={30}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="perangkat"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={30}
                color={color}
              />
            ),
          }}
        />

        {hiddenScreens.map((screenName) => (
          <Tabs.Screen
            key={screenName}
            name={screenName}
            options={{ href: null }}
          />
        ))}
      </Tabs>

      {/* Solid background covering ONLY the small gap beneath the floating tab bar */}
      <BottomGapCover
        screenColor={screenColor}
        height={bottomCoverHeight}
      />
    </View>
  );
}
