import { Alert, Linking } from "react-native";
import * as Application from "expo-application";

const UPDATE_URL = "https://www.batarienergy.com/app-version.json";

export async function checkAppUpdate() {
  try {
    const res = await fetch(UPDATE_URL);
    const data = await res.json();

    const currentBuild = Number(Application.nativeBuildVersion || 0);
    const latestBuild = Number(data.latestBuild || 0);

    if (latestBuild <= currentBuild) return;

    Alert.alert(
      data.forceUpdate ? "Update Wajib" : "Update Tersedia",
      data.message || "Versi terbaru aplikasi sudah tersedia.",
      [
        ...(data.forceUpdate
          ? []
          : [{ text: "Nanti", style: "cancel" }]),

        {
          text: "Update Sekarang",
          onPress: () => Linking.openURL(data.apkUrl),
        },
      ],
      { cancelable: !data.forceUpdate }
    );
  } catch (error) {
    console.log("Gagal cek update:", error);
  }
}