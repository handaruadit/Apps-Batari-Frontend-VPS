import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SolarIcon from "@/components/SolarIcon";
import { appColors } from "@/config/theme";

export default function MainLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          position: "absolute",
          width: 300, // 🔻 dari 346 → 300
          height: 70, // 🔻 dari 84 → 70
          left: "50%",
          bottom: 20,

          backgroundColor: appColors.bubble,
          borderRadius: 18, // sedikit diperkecil

          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",

          paddingHorizontal: 16, // 🔻 dari 20
          paddingVertical: 6,

          borderTopWidth: 0,

          shadowColor: "rgba(14, 165, 233, 0.77)",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 5,
          elevation: 8,

          transform: [{ translateX: -150 }], // setengah dari 300
        },

        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#94A3B8",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="plant"
        options={{
          title: "Plant",
          tabBarIcon: ({ color }) => <SolarIcon color={color} size={26} />,
        }}
      />

      <Tabs.Screen
        name="me"
        options={{
          title: "Me",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
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
