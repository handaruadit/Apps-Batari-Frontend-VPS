//========== IMPORTS ==========
import { appFont } from "@/config/theme";
import { StyleSheet } from "react-native";

//========== STYLES ==========
export default StyleSheet.create({
  container: {
    marginTop: 10,
    width: "100%",
  },
  toolbar: {
    minHeight: 32,
    marginBottom: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  toolbarButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  canvas: {
    position: "relative",
    alignSelf: "center",
  },
  gestureLayer: {
    position: "absolute",
    zIndex: 2,
  },
  legend: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  legendItem: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontFamily: appFont,
    fontSize: 11,
    fontWeight: "700",
  },
  tooltip: {
    position: "absolute",
    zIndex: 3,
    width: 148,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tooltipTitle: {
    marginBottom: 5,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "800",
  },
  tooltipRow: {
    minHeight: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  tooltipDot: {
    width: 6,
    height: 6,
    marginRight: 6,
    borderRadius: 3,
  },
  tooltipLabel: {
    flex: 1,
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "600",
  },
  tooltipValue: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "800",
  },
  state: {
    minHeight: 286,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stateTitle: {
    marginTop: 12,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  stateBody: {
    marginTop: 6,
    fontFamily: appFont,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  summaryRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryItem: {
    flexGrow: 1,
    flexBasis: "30%",
    minWidth: 92,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryLabel: {
    fontFamily: appFont,
    fontSize: 10,
    fontWeight: "700",
  },
  summaryValue: {
    marginTop: 3,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "800",
  },
});
