//===== (Imports) ======
import { appColors, appFont } from "@/config/theme";
import { StyleSheet } from "react-native";
import { POWER_CHART_LAYOUT } from "../constants/overviewConstants";

//===== (Styles) ======
const styles = StyleSheet.create({
  chartSection: {
    marginTop: 14,
    paddingTop: 2,
  },
  chartLandscapeSection: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
    paddingTop: 0,
  },
  chartCanvasWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  chartMarkerTouchArea: {
    position: "absolute",
    left: 0,
    top: 0,
    zIndex: 2,
  },
  chartMarkerTriangle: {
    position: "absolute",
    width: 0,
    height: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    backgroundColor: "transparent",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.32,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  chartSwitchRow: {
    marginTop: POWER_CHART_LAYOUT.switchMarginTop,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "nowrap",
    width: "100%",
    paddingHorizontal: 2,
  },
  chartSwitchItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  chartSwitchButton: {
    width: POWER_CHART_LAYOUT.switchWidth,
    height: POWER_CHART_LAYOUT.switchHeight,
    borderRadius: POWER_CHART_LAYOUT.switchHeight / 2,
    padding: POWER_CHART_LAYOUT.switchPadding,
    justifyContent: "center",
  },
  chartSwitchKnob: {
    width:
      POWER_CHART_LAYOUT.switchHeight - POWER_CHART_LAYOUT.switchPadding * 2,
    height:
      POWER_CHART_LAYOUT.switchHeight - POWER_CHART_LAYOUT.switchPadding * 2,
    borderRadius: POWER_CHART_LAYOUT.switchHeight / 2,
  },
  chartSwitchLabel: {
    marginTop: 5,
    width: "100%",
    fontFamily: appFont,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 0,
    textAlign: "center",
  },
  chartSelectedInfo: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "rgba(2,7,19,0.38)",
    borderWidth: 1,
    borderColor: "rgba(248,250,252,0.1)",
  },
  chartSelectedInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 9,
  },
  chartSelectedInfoTitle: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
  chartSelectedInfoMeta: {
    flexShrink: 1,
    color: appColors.textSoft,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "right",
  },
  chartSelectedInfoGrid: {
    gap: 7,
  },
  chartSelectedInfoItem: {
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
  },
  chartSelectedInfoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 7,
  },
  chartSelectedInfoLabel: {
    flex: 1,
    minWidth: 0,
    color: appColors.textMuted,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
  },
  chartSelectedInfoValue: {
    flexShrink: 0,
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right",
  },
  chartSavePdfButton: {
    minHeight: 38,
    marginTop: 12,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: appColors.accent,
  },
  chartSavePdfButtonDisabled: {
    opacity: 0.68,
  },
  chartSavePdfText: {
    color: appColors.text,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
});

export default styles;
