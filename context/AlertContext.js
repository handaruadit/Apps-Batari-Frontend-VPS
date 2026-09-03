//===== (Imports) ======
import { useAppSettings } from "@/context/AppSettingsContext";
import { Ionicons } from "@expo/vector-icons";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

//===== (Global Emitter Ref) ======
let globalAlertHandler = null;

export function registerGlobalAlertHandler(handler) {
  globalAlertHandler = handler;
}

export function triggerGlobalAlert(title, message, buttons, options) {
  if (typeof globalAlertHandler === "function") {
    globalAlertHandler(title, message, buttons, options);
    return true;
  }
  return false;
}

//===== (AlertContext) ======
const AlertContext = createContext(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

//===== (determineAlertType) ======
export function determineAlertType(title = "", message = "", buttons = []) {
  const text = `${title} ${message}`.toLowerCase();

  // 1. Destructive Actions (Delete, Remove, Clear) -> Danger
  const hasDestructive = buttons.some(
    (b) =>
      b.style === "destructive" ||
      (b.text && /hapus|delete|remove|bersihkan/i.test(b.text)),
  );
  if (hasDestructive) return "danger";

  // 2. Errors, Failures, Rejections -> Danger (Check FIRST before success keywords)
  const isDanger =
    /gagal|failed|error|salah|ditolak|rusak|invalid|wrong|tidak berhasil|belum berhasil|tidak cocok|tidak valid|tidak dapat|tidak bisa|tidak ditemukan|kadaluarsa|expired|denied|unauthorized|forbidden|batal|penghapusan/i.test(
      text,
    );
  if (isDanger) {
    return "danger";
  }

  // 3. Warnings & Confirmations -> Warning
  const isWarning =
    /peringatan|warning|perhatian|maksimal|limit|caution|periksa|cek kembali|yakin|konfirmasi/i.test(
      text,
    );
  if (isWarning) {
    return "warning";
  }

  // 4. Success -> Success (Only when not negative)
  const isSuccess =
    /berhasil|success|tersimpan|ready|selesai|created|updated|disimpan|terkirim|sukses/i.test(
      text,
    ) && !/tidak|belum|bukan/i.test(text);
  if (isSuccess) {
    return "success";
  }

  return "info";
}

//===== (AlertProvider) ======
export function AlertProvider({ children }) {
  const { colors, themeMode } = useAppSettings();

  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [],
    type: "info",
    cancelable: true,
  });

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  //===== (showAlert) ======
  const showAlert = useCallback((title, message, buttons, options = {}) => {
    let resolvedButtons = buttons;

    if (!resolvedButtons || resolvedButtons.length === 0) {
      resolvedButtons = [{ text: "OK" }];
    }

    const type = options.type || determineAlertType(title, message, resolvedButtons);

    setAlertState({
      visible: true,
      title: title || "",
      message: message || "",
      buttons: resolvedButtons,
      type,
      cancelable: options.cancelable !== false,
    });
  }, []);

  //===== (hideAlert) ======
  const hideAlert = useCallback(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlertState((prev) => ({ ...prev, visible: false }));
    });
  }, [scaleAnim, opacityAnim]);

  //===== (Register Global Handler) ======
  useEffect(() => {
    registerGlobalAlertHandler(showAlert);
    return () => registerGlobalAlertHandler(null);
  }, [showAlert]);

  //===== (Animate on Show) ======
  useEffect(() => {
    if (alertState.visible) {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [alertState.visible, scaleAnim, opacityAnim]);

  //===== (handleButtonPress) ======
  const handleButtonPress = (btn) => {
    hideAlert();
    if (typeof btn.onPress === "function") {
      // Small timeout to allow modal animation to dismiss gracefully
      setTimeout(() => {
        btn.onPress();
      }, 100);
    }
  };

  //===== (Icon & Color Config) ======
  const iconConfig = {
    success: {
      name: "checkmark-circle-outline",
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.14)",
    },
    danger: {
      name: "alert-circle-outline",
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.14)",
    },
    warning: {
      name: "warning-outline",
      color: "#F59E0B",
      bgColor: "rgba(245, 158, 11, 0.14)",
    },
    info: {
      name: "information-circle-outline",
      color: colors.accent || "#18AEE6",
      bgColor: "rgba(24, 174, 230, 0.14)",
    },
  }[alertState.type] || {
    name: "information-circle-outline",
    color: colors.accent || "#18AEE6",
    bgColor: "rgba(24, 174, 230, 0.14)",
  };

  const isLight = themeMode === "light";
  const cardBg = isLight ? "#FFFFFF" : colors.bubble || "#151F30";
  const cardBorder = isLight ? "#E2E8F0" : colors.bubbleBorder || "rgba(255,255,255,0.1)";

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}

      <Modal
        visible={alertState.visible}
        transparent
        animationType="none"
        onRequestClose={() => {
          if (alertState.cancelable) hideAlert();
        }}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => {
            if (alertState.cancelable) hideAlert();
          }}
        >
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: cardBg,
                borderColor: cardBorder,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Top Icon Badge */}
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: iconConfig.bgColor },
              ]}
            >
              <Ionicons
                name={iconConfig.name}
                size={36}
                color={iconConfig.color}
              />
            </View>

            {/* Title */}
            {Boolean(alertState.title) && (
              <Text style={[styles.title, { color: colors.text }]}>
                {alertState.title}
              </Text>
            )}

            {/* Message */}
            {Boolean(alertState.message) && (
              <Text style={[styles.message, { color: colors.textMuted }]}>
                {alertState.message}
              </Text>
            )}

            {/* Action Buttons */}
            <View
              style={[
                styles.buttonContainer,
                alertState.buttons.length === 2
                  ? styles.buttonRow
                  : styles.buttonColumn,
              ]}
            >
              {alertState.buttons.map((btn, index) => {
                const isCancel = btn.style === "cancel";
                const isDestructive =
                  btn.style === "destructive" ||
                  (alertState.type === "danger" && !isCancel);

                let btnBg = colors.accent || "#18AEE6";
                let btnTextColor = "#FFFFFF";
                let btnBorderColor = "transparent";

                if (isCancel) {
                  btnBg = isLight ? "#F1F5F9" : "rgba(255,255,255,0.06)";
                  btnTextColor = colors.textMuted || "#94A3B8";
                  btnBorderColor = cardBorder;
                } else if (isDestructive) {
                  btnBg = "#EF4444";
                  btnTextColor = "#FFFFFF";
                }

                return (
                  <TouchableOpacity
                    key={`alert-btn-${index}`}
                    activeOpacity={0.8}
                    style={[
                      styles.btn,
                      alertState.buttons.length === 2 && styles.btnFlex,
                      {
                        backgroundColor: btnBg,
                        borderColor: btnBorderColor,
                        borderWidth: isCancel ? 1 : 0,
                      },
                    ]}
                    onPress={() => handleButtonPress(btn)}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        { color: btnTextColor },
                        !isCancel && styles.btnTextBold,
                      ]}
                    >
                      {btn.text || "OK"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </AlertContext.Provider>
  );
}

//===== (Styles) ======
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  card: {
    width: "100%",
    maxWidth: 330,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    width: "100%",
    gap: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  buttonColumn: {
    flexDirection: "column",
  },
  btn: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  btnFlex: {
    flex: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  btnTextBold: {
    fontWeight: "700",
  },
});
