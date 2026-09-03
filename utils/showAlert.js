import { triggerGlobalAlert } from "@/context/AlertContext";
import { Alert, Platform } from "react-native";

/**
 * Global themed alert that routes to our CustomAlertModal when available,
 * and falls back gracefully on web or unmounted environments.
 */
export function showAlert(title, message, buttons, options) {
  // If global custom alert handler is active, use our custom themed modal
  const handled = triggerGlobalAlert(title, message, buttons, options);
  if (handled) {
    return;
  }

  if (Platform.OS === "web") {
    try {
      const fullMessage = message ? `${title}\n\n${message}` : title;
      if (typeof window !== "undefined" && typeof window.alert === "function") {
        window.alert(fullMessage);
      }
    } catch (e) {
      console.warn("[showAlert] web alert failed:", e);
    }

    if (buttons && buttons.length > 0) {
      const lastButton = buttons[buttons.length - 1];
      if (lastButton.onPress) {
        lastButton.onPress();
      }
    }
  } else {
    Alert.alert(title, message, buttons, options);
  }
}

// Monkey-patch native Alert.alert on non-test runtime to route through custom modal
if (
  process.env.NODE_ENV !== "test" &&
  typeof Alert !== "undefined" &&
  Alert.alert &&
  Alert.alert !== showAlert
) {
  const originalNativeAlert = Alert.alert.bind(Alert);
  Alert.alert = function (title, message, buttons, options) {
    const handled = triggerGlobalAlert(title, message, buttons, options);
    if (!handled) {
      originalNativeAlert(title, message, buttons, options);
    }
  };
}
