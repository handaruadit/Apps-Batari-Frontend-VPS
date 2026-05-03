import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { appColors } from "@/config/theme";

export default function PlantDetailLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: "absolute",
          left: 40,
          right: 40,
          bottom: 12,

          height: 60,              // tinggi kotak tab
          paddingHorizontal: 24,   // jarak logo dari kiri-kanan
          paddingTop: 10,           // dorong isi ke bawah
          paddingBottom: 0,        // dorong isi ke atas

          backgroundColor: appColors.bubble,
          borderRadius: 20,
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
          height: 60,              // tinggi area klik tiap icon
          alignItems: "center",
          justifyContent: "center",

          marginHorizontal: 0,     // tambah kalau ingin kedua icon makin ke tengah
          paddingTop: 0,           // turunkan icon
          paddingBottom: 0,        // naikkan icon
        },

        tabBarIconStyle: {
          width: 24,
          height: 24,
          marginTop: 0,            // turunkan/naikkan icon global
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
            <View
              style={{
                width: 24,              // ukuran area bungkus icon
                height: 24,
                alignItems: "center",
                justifyContent: "center",

                marginTop: 0,           // turunkan icon overview
                marginBottom: 0,
                marginLeft: 15,          // geser overview ke kanan/kiri
                marginRight: 0,
              }}
            >
              <Ionicons
                name={focused ? "grid" : "grid-outline"}
                size={30}               // ukuran logo overview
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="perangkat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 24,
                height: 24,
                alignItems: "center",
                justifyContent: "center",

                marginTop: 0,           // turunkan icon perangkat
                marginBottom: 0,
                marginLeft: 0,          // geser perangkat ke kanan/kiri
                marginRight: 0,
              }}
            >
              <Ionicons
                name={focused ? "cube" : "cube-outline"}
                size={30}               // ukuran logo perangkat
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="data"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="eksperimen"
        options={{ href: null }}
      />

      <Tabs.Screen
        name="index"
        options={{ href: null }}
      />
    </Tabs>
  );
}
