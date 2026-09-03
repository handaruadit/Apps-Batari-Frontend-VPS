import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { appColors, appFont } from "@/config/theme";

//===== (Qr Scanner Screen) ======
export default function QrScannerScreen() {
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(home)/plant");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        handleBack();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={handleBack}
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.title}>Scan QR</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.scannerPlaceholder}>
          <Ionicons name="qr-code-outline" size={64} color={appColors.accent} />
          <Text style={styles.placeholderTitle}>QR Scanner</Text>
          <Text style={styles.placeholderText}>
            Kamera scanner siap dikembangkan saat dependency kamera/QR sudah
            ditentukan.
          </Text>
          {/* TODO: add camera/QR scanner implementation when the project confirms the camera dependency. */}
        </View>
      </View>
    </SafeAreaView>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  headerSpacer: {
    width: 44,
  },
  scannerPlaceholder: {
    flex: 1,
    minHeight: 360,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    backgroundColor: appColors.bubble,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  placeholderTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "700",
    fontFamily: appFont,
    marginTop: 14,
    marginBottom: 8,
  },
  placeholderText: {
    color: appColors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: appFont,
  },
});
