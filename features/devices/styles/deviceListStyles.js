//===== (Imports) ======
import { StyleSheet } from "react-native";

import { appColors, appFont } from "@/config/theme";

//===== (Device List Styles) ======
const deviceListStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  container: {
    flex: 1,
    backgroundColor: appColors.screen,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "500",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  headerCard: {
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: 26,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  stateCard: {
    padding: 18,
    borderRadius: 18,
    backgroundColor: appColors.bubble,
    borderWidth: 1,
    borderColor: appColors.bubbleBorder,
    alignItems: "center",
    gap: 10,
  },
  stateText: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  inverterTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 6,
  },
  infoBlock: {
    marginBottom: 12,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
    lineHeight: 20,
  },
  deviceIdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  copyButtonText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
  },
  parameterSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: appColors.bubbleBorder,
    paddingTop: 14,
  },
  parameterTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: appColors.text,
    fontFamily: appFont,
    marginBottom: 10,
  },
  parameterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    gap: 12,
  },
  parameterNameWrap: {
    flex: 1,
  },
  parameterCategory: {
    fontSize: 12,
    color: appColors.textMuted,
    fontFamily: appFont,
    marginBottom: 2,
  },
  parameterType: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    fontFamily: appFont,
  },
  parameterValue: {
    fontSize: 14,
    fontWeight: "800",
    color: appColors.accent,
    fontFamily: appFont,
    textAlign: "right",
  },
  emptyParameterText: {
    fontSize: 14,
    color: appColors.textMuted,
    fontFamily: appFont,
  },
  cardHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});

export default deviceListStyles;
