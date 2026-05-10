import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, useWindowDimensions } from "react-native";
import SolarIcon from "@/components/SolarIcon";
import { appColors } from "@/config/theme";

export default function MainLayout() {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380;
  const isShortScreen = height < 720;

  const tabHorizontalMargin = isSmallScreen ? 18 : 24;
  const tabBottom = isShortScreen ? 12 : 16;
  const tabHeight = isSmallScreen ? 60 : 64;
  const tabRadius = 22;

  const iconSize = isSmallScreen ? 26 : 28;
  const solarIconSize = isSmallScreen ? 30 : 34;
  const iconBoxSize = isSmallScreen ? 30 : 34;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: appColors.screen },

        tabBarStyle: {
          position: "absolute",
          left: tabHorizontalMargin,
          right: tabHorizontalMargin,
          bottom: tabBottom,
          height: tabHeight,
          backgroundColor: appColors.bubble,
          borderRadius: tabRadius,
          paddingHorizontal: 0,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(0,170,255,0.45)",
          shadowColor: "#00AEEF",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        },

        tabBarActiveTintColor: "#2F80FF",
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",
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

                // Atur posisi logo Plant dari sini
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
          title: "Me",
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

      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="add-device"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
