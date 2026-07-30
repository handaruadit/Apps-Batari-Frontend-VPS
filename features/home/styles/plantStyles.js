//===== (Imports) ======
import { appColors, appFont } from "@/config/theme";
import { StyleSheet } from "react-native";

//===== (Plant Styles) ======
export const plantStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
  },
  searchBox: {
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: appColors.bubble,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    paddingHorizontal: 16,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    color: appColors.text,
    fontFamily: appFont,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 15,
  },
  emptyText: {
    textAlign: "center",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginTop: 24,
    fontSize: 15,
  },
  navigationOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: appColors.screen,
  },
  navigationLoadingText: {
    marginTop: 12,
    color: appColors.textSoft,
    fontFamily: appFont,
    fontSize: 15,
    fontWeight: "600",
  },
});
