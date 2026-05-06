import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, useWindowDimensions } from "react-native";
import SolarIcon from "@/components/SolarIcon";
import { appColors } from "@/config/theme";

export default function MainLayout() {
  const { width, height } = useWindowDimensions();

  const isSmallScreen = width < 380;
  const isShortScreen = height < 720;

  const tabHorizontalMargin = isSmallScreen ? 16 : 24;
  const tabBottom = isShortScreen ? 12 : 18;
  const tabHeight = isSmallScreen ? 62 : 68;
  const tabRadius = isSmallScreen ? 16 : 18;

  const iconSize = isSmallScreen ? 26 : 28;
  const solarIconSize = isSmallScreen ? 30 : 34;
  const iconBoxSize = isSmallScreen ? 30 : 34;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          left: tabHorizontalMargin,
          right: tabHorizontalMargin,
          bottom: tabBottom,
          height: tabHeight,
          backgroundColor: appColors.bubble,
          borderRadius: tabRadius,
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 0,
          shadowColor: "rgba(14, 165, 233, 0.77)",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 5,
          elevation: 8,
        },

        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",
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
          marginTop: 6,
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
                transform: [{ translateY: 6 }],
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