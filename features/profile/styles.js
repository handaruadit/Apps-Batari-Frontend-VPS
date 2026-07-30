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
    paddingTop: 18,
    paddingHorizontal: 14,
    paddingBottom: 120,
  },
  row: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: appColors.bubbleBorder,
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
    marginRight: 10,
  },
  rowTitle: {
    fontSize: 16,
    color: appColors.text,
    fontWeight: "500",
    fontFamily: appFont,
  },
  rightText: {
    fontSize: 15,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  choiceGroup: {
    flexDirection: "row",
    gap: 8,
  },
  choiceButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  choiceButtonText: {
    fontSize: 12,
    fontWeight: "700",
    fontFamily: appFont,
  },
});
