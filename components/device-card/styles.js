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
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    paddingTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  topRight: {
    alignItems: "flex-end",
    zIndex: 35,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 35,
  },
  pinnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(24, 174, 230, 0.4)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  pinnedText: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "600",
    color: "#E2E8F0",
    letterSpacing: 0.2,
  },
  cardHeaderIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  menuCloseBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
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

  // 2-Column In-Image Menu Overlay
  imageMenuOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
    zIndex: 25,
    elevation: 8,
  },
  menuGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    paddingRight: 28, // Leave space for top-right close button
  },
  menuColumn: {
    flex: 1,
    gap: 6,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRadius: 10,
    gap: 7,
  },
  menuText: {
    fontSize: 12,
    color: appColors.text,
    fontWeight: "600",
    fontFamily: appFont,
  },
  deleteText: {
    color: "#EF4444",
  },
});
