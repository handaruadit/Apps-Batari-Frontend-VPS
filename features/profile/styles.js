//===== (Imports) ======
import { appColors, appFont } from "@/config/theme";
import { StyleSheet } from "react-native";

//===== (Profile Styles) ======
export const profileStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 120,
  },

  // Profile Header Card
  profileHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(24, 174, 230, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#18AEE6",
    fontFamily: appFont,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "700",
    fontFamily: appFont,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    fontFamily: appFont,
  },

  // Section Grouping
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontFamily: appFont,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  row: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 28,
    alignItems: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    fontFamily: appFont,
  },
  rightText: {
    fontSize: 14,
    fontFamily: appFont,
  },
  choiceGroup: {
    flexDirection: "row",
    gap: 6,
  },
  choiceButton: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceButtonText: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: appFont,
  },

  // Bottom Sheet Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  bottomSheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    maxHeight: "85%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.15)",
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: appFont,
  },

  // Form Inputs
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 6,
    fontFamily: appFont,
  },
  formInput: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: appFont,
    justifyContent: "center",
  },

  // Switch Rows
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 3,
  },
  switchSubtitle: {
    fontSize: 12,
    fontFamily: appFont,
    lineHeight: 16,
  },

  // Center Modal
  centerModalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  centerModalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 26,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: "center",
    position: "relative",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  modalCloseIconButton: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(150, 150, 150, 0.12)",
    zIndex: 10,
  },
  aboutIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(24, 174, 230, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  dangerIconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  aboutAppTitle: {
    fontSize: 19,
    fontWeight: "700",
    fontFamily: appFont,
    textAlign: "center",
    marginBottom: 4,
  },
  aboutVersionBadge: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 10,
  },
  aboutDescription: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
    fontFamily: appFont,
    marginBottom: 14,
  },
  aboutDivider: {
    width: "100%",
    height: 1,
    marginVertical: 12,
  },
  aboutLinkList: {
    width: "100%",
    gap: 8,
    marginBottom: 14,
  },
  aboutLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 4,
  },
  aboutLinkText: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: appFont,
  },
  aboutCopyright: {
    fontSize: 11,
    textAlign: "center",
    fontFamily: appFont,
  },

  // Modal Actions
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: appFont,
  },
  modalConfirmBtn: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    fontFamily: appFont,
  },
});
