//===== (Imports) ======
import { appColors, appFont } from "@/config/theme";
import { StyleSheet } from "react-native";

//===== (Device Card Styles) ======
export const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  imageWrapper: {
    height: 130,
  },
  bg: {
    flex: 1,
  },
  imageStyle: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imageOverlay: {
    flex: 1,
    paddingTop: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  topRight: {
    alignItems: "flex-end",
  },
  textSection: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: appColors.bubble,
  },
  title: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: "600",
    fontFamily: appFont,
    marginBottom: 4,
    letterSpacing: 0,
  },
  subtitle: {
    color: appColors.textMuted,
    fontSize: 13,
    fontWeight: "400",
    fontFamily: appFont,
    letterSpacing: 0,
  },
  statusRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 7,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
    fontFamily: appFont,
    letterSpacing: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 95,
    paddingRight: 22,
  },
  popupMenu: {
    width: 150,
    backgroundColor: appColors.bubble,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  menuText: {
    fontSize: 15,
    color: appColors.text,
    fontWeight: "500",
    fontFamily: appFont,
  },
  deleteText: {
    color: "#DC2626",
  },
});
