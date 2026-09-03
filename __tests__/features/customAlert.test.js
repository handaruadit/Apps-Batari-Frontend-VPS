import {
  AlertProvider,
  determineAlertType,
  triggerGlobalAlert,
  useAlert,
} from "@/context/AlertContext";
import { showAlert } from "@/utils/showAlert";
import { act, renderHook } from "@testing-library/react-native";
import React from "react";

describe("CustomAlert System", () => {
  it("registers and triggers global alert handlers cleanly", () => {
    const wrapper = ({ children }) => <AlertProvider>{children}</AlertProvider>;

    const { result } = renderHook(() => useAlert(), { wrapper });

    expect(typeof result.current.showAlert).toBe("function");

    act(() => {
      showAlert("Peringatan", "Data tidak boleh kosong");
    });
  });

  it("handles triggerGlobalAlert when no handler is registered", () => {
    const handled = triggerGlobalAlert("Test", "Message");
    expect(handled).toBe(false);
  });

  describe("determineAlertType", () => {
    it("correctly identifies danger when text has 'Login gagal' and 'tidak berhasil'", () => {
      const type = determineAlertType("Login gagal", "Google Sign-In tidak berhasil.");
      expect(type).toBe("danger");
    });

    it("correctly identifies danger when login credentials are wrong", () => {
      const type = determineAlertType("Login gagal", "Email atau password salah.");
      expect(type).toBe("danger");
    });

    it("correctly identifies danger on general errors", () => {
      const type = determineAlertType("Error", "Gagal memuat data dari server.");
      expect(type).toBe("danger");
    });

    it("correctly identifies success on positive actions without negative words", () => {
      const type = determineAlertType("Sukses", "Data profil berhasil diperbarui.");
      expect(type).toBe("success");
    });

    it("correctly identifies warning on caution messages", () => {
      const type = determineAlertType("Peringatan", "Maksimal 3 stasiun dapat di-pin.");
      expect(type).toBe("warning");
    });

    it("correctly marks destructive button alerts as danger", () => {
      const type = determineAlertType(
        "Hapus Stasiun",
        "Apakah Anda yakin?",
        [{ text: "Batal", style: "cancel" }, { text: "Hapus", style: "destructive" }],
      );
      expect(type).toBe("danger");
    });
  });
});
