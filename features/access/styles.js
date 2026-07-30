//===== (Imports) ======
import { appFont } from "@/config/theme";
import { StyleSheet } from "react-native";

//===== (Styles) ======
export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingTop: 10,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    borderWidth: 1,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontFamily: appFont,
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 2,
    fontFamily: appFont,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  cardTitle: {
    fontFamily: appFont,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10,
  },
  userRow: {
    minHeight: 58,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "800",
  },
  userPhone: {
    marginTop: 2,
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "600",
  },
  roleText: {
    fontFamily: appFont,
    fontSize: 12,
    fontWeight: "900",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  input: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontFamily: appFont,
    fontSize: 14,
    fontWeight: "700",
  },
  searchButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
