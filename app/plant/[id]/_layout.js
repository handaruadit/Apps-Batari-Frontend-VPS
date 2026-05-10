import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { appColors } from "@/config/theme";

const hiddenScreens = [
  "data",
  "eksperimen",
  "index",
  "sub-plant/data-battery",
  "sub-plant/data-grid",
  "sub-plant/data-load",
  "sub-plant/data-pv",
];

export default function PlantDetailLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: appColors.screen },

        tabBarStyle: {
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 16,
          height: 64,
          paddingHorizontal: 0,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: appColors.bubble,
          borderRadius: 22,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(0,170,255,0.45)",
          shadowColor: "#00AEEF",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 10,
        },

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
        tabBarInactiveTintColor: "rgba(255,255,255,0.65)",
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
  );
}
