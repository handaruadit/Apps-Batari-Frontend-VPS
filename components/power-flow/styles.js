//===== (Imports) ======

import { StyleSheet } from "react-native";

import {
  POWER_FLOW_COLORS,
  POWER_FLOW_FONT_SIZE,
  POWER_FLOW_LAYOUT,
} from "./constants";

//===== (Styles) ======

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    paddingTop: POWER_FLOW_LAYOUT.containerPaddingTop,
    paddingBottom: POWER_FLOW_LAYOUT.containerPaddingBottom,
    paddingHorizontal: POWER_FLOW_LAYOUT.containerPaddingHorizontal,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: POWER_FLOW_LAYOUT.containerMinHeight,
    marginBottom: 16,
    overflow: "visible",
    elevation: 5,
  },

  sideColumn: {
    width: POWER_FLOW_LAYOUT.sideColumnWidth,
    justifyContent: "space-between",
    gap: POWER_FLOW_LAYOUT.sideColumnGap,
  },

  metricBlock: {
    width: POWER_FLOW_LAYOUT.metricBlockWidth,
    height: POWER_FLOW_LAYOUT.metricBlockHeight,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "visible",
  },

  metricIcon: {
    height: POWER_FLOW_LAYOUT.metricIconHeight,
    marginBottom: POWER_FLOW_LAYOUT.metricIconMarginBottom,
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },

  flashWrap: {
    width: 40,
    height: 40,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  flashPlus: {
    position: "absolute",
    right: -2,
    bottom: 0,
  },

  metricTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },

  metricTitleSlot: {
    height: POWER_FLOW_LAYOUT.metricTitleHeight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  metricValueSlot: {
    height: POWER_FLOW_LAYOUT.metricValueHeight,
    marginTop: POWER_FLOW_LAYOUT.metricValueMarginTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  metricValue: {
    fontWeight: "800",
    textAlign: "center",
  },

  metricUnit: {
    fontWeight: "800",
  },

  metricPercent: {
    marginTop: 2,
    fontWeight: "700",
    textAlign: "center",
  },

  metricSubtitle: {
    marginTop: 6,
    color: "#D7DDE6",
    fontSize: 7,
    lineHeight: 9,
    fontWeight: "600",
    textAlign: "center",
  },

  centerSection: {
    width: POWER_FLOW_LAYOUT.centerSectionWidth,
    alignItems: "center",
    justifyContent: "center",
  },

  ringWrapper: {
    width: POWER_FLOW_LAYOUT.ringSize,
    height: POWER_FLOW_LAYOUT.ringSize,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  centerContent: {
    position: "absolute",
    top: POWER_FLOW_LAYOUT.centerContentTop,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  centerLabel: {
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.label,
    lineHeight: POWER_FLOW_FONT_SIZE.center.labelLineHeight,
    fontWeight: "350",
    textAlign: "center",
  },

  centerValue: {
    marginTop: 10,
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.value,
    lineHeight: POWER_FLOW_FONT_SIZE.center.valueLineHeight,
    fontWeight: "800",
    textAlign: "center",
  },

  centerUnit: {
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.center.unit,
    fontWeight: "800",
  },

  gridBlock: {
    width: POWER_FLOW_LAYOUT.gridBlockWidth,
    height: POWER_FLOW_LAYOUT.gridBlockHeight,
    marginTop: POWER_FLOW_LAYOUT.gridBlockMarginTop,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  gridValue: {
    marginTop: 4,
    color: POWER_FLOW_COLORS.grid,
    fontSize: POWER_FLOW_FONT_SIZE.grid.value,
    lineHeight: POWER_FLOW_FONT_SIZE.grid.valueLineHeight,
    fontWeight: "800",
    textAlign: "center",
  },

  gridUnit: {
    fontSize: POWER_FLOW_FONT_SIZE.grid.unit,
    fontWeight: "800",
    color: POWER_FLOW_COLORS.grid,
  },

  gridPercent: {
    marginTop: 2,
    fontWeight: "700",
    textAlign: "center",
  },

  gridLabel: {
    marginTop: 4,
    color: "#FFFFFF",
    fontSize: POWER_FLOW_FONT_SIZE.grid.title,
    lineHeight: POWER_FLOW_FONT_SIZE.grid.titleLineHeight,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default styles;
