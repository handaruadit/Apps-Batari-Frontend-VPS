//===== (Imports) ======
import { StyleSheet } from "react-native";

import { appColors, appFont } from "@/config/theme";

//===== (Plant Form Styles) ======
const plantFormStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingTop: 10,
    paddingBottom: 36,
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
  sectionCard: {
    backgroundColor: appColors.bubble,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 14,
  },
  label: {
    color: appColors.textSoft,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 8,
    marginTop: 2,
  },
  required: {
    color: "#F87171",
  },
  input: {
    backgroundColor: appColors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    color: appColors.text,
    fontSize: 16,
    fontFamily: appFont,
    marginBottom: 14,
  },
  inputButton: {
    backgroundColor: appColors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: appColors.inputBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  inputButtonText: {
    color: appColors.text,
    fontSize: 16,
    fontFamily: appFont,
  },
  placeholderText: {
    color: appColors.textMuted,
    fontSize: 16,
    fontFamily: appFont,
  },
  saveButton: {
    backgroundColor: appColors.accent,
    borderRadius: 16,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: appColors.bubble,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "75%",
    padding: 16,
    borderTopWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  modalTitle: {
    color: appColors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  optionItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: appColors.bubbleBorder,
  },
  optionItemText: {
    color: appColors.textSoft,
    fontSize: 15,
  },
  closeButton: {
    marginTop: 14,
    backgroundColor: appColors.input,
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: appColors.text,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default plantFormStyles;
