import { Platform, StyleSheet } from "react-native";
import { configColor, dimWhite, primaryColor, secondaryColor } from "./Colors";
import { colorAlpha } from "./Colors";

export const styles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: "500",
    color: "black",
  },

  title: {
    fontWeight: "900",
    color: "black",
  },

  // backgrounds
  whiteBg: {
    backgroundColor: "white",
  },

  lightBg: {
    backgroundColor: dimWhite,
  },

  primaryBg: {
    backgroundColor: primaryColor,
  },
  secondaryBg: {
    backgroundColor: secondaryColor,
  },

  // text size
  font10: {
    fontSize: 10,
  },
  font11: {
    fontSize: 11,
  },

  font12: {
    fontSize: 12,
  },

  font13: {
    fontSize: 13,
  },

  font15: {
    fontSize: 15,
  },

  font16: {
    fontSize: 16,
  },

  // flexbox
  flexCenter: {
    alignItems: "center",
    justifyContent: "center",
  },

  flexNullCenter: {
    alignItems: "center",
  },

  flexSpaceCenter: {
    justifyContent: "space-between",
  },

  flexEnd: {
    justifyContent: "flex-end",
  },

  flexRow: {
    flexDirection: "row",
  },

  flexWrap: {
    flexWrap: "wrap",
  },

  flexGrow: {
    flexGrow: 1,
  },
  flex1: {
    flex: 1,
  },

  // gaps
  gap5: {
    gap: 5,
  },
  gap10: {
    gap: 10,
  },

  gap15: {
    gap: 15,
  },

  gap20: {
    gap: 20,
  },

  // padding
  p5: {
    padding: 5,
  },
  p10: {
    padding: 10,
  },

  p15: {
    padding: 15,
  },

  p20: {
    padding: 20,
  },

  // margin
  m10: {
    margin: 10,
  },
  m20: {
    margin: 20,
  },

  // width and height
  h100: {
    height: "100%",
  },
  h80: {
    height: "80%",
  },
  w100: {
    width: "100%",
  },

  // text alignment
  textCenter: {
    textAlign: "center",
    textAlignVertical: "center",
  },

  textWrap: {
    flexWrap: "wrap",
    flex: 1,
  },

  // text color
  redColor: {
    color: "red",
  },
  greyColor: {
    color: "grey",
  },
  blackColor: {
    color: "black",
  },
  whiteColor: {
    color: "white",
  },
  primaryColor: {
    color: primaryColor,
  },
  secondaryColor: {
    color: secondaryColor,
  },

  // radius
  radius5: {
    borderRadius: 5,
    ...(Platform.OS === "ios" && { overflow: "hidden" }),
  },
  radius10: {
    borderRadius: 10,
    ...(Platform.OS === "ios" && { overflow: "hidden" }),
  },
  radius15: {
    borderRadius: 15,
    ...(Platform.OS === "ios" && { overflow: "hidden" }),
  },

  // image
  backgroundImage: {
    opacity: 0.1,
    height: "105%",
    width: "110%",
    position: "absolute",
  },

  // borders
  borderBox: {
    borderColor: "#ccc",
    borderRadius: 10,
    borderWidth: 1,
  },

  borderTop: {
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },

  borderEnd: {
    borderEndWidth: 0.5,
    borderColor: "#ccc",
  },

  textInputFocused: {
    borderColor: configColor,
    borderRadius: 10,
    borderWidth: 2,
  },

  borderLight: {
    borderColor: "#ddd",
    borderWidth: 0.5,
  },

  // overflow
  overflow: {
    overflow: "hidden",
  },

  // font weight
  semiBold: {
    fontWeight: "500",
  },

  bold: {
    fontWeight: "bold",
  },

  extraBold: {
    fontWeight: "900",
  },

  light: {
    fontWeight: "300",
  },

  // text transform
  capitalize: {
    textTransform: "capitalize",
  },

  // positions
  absolute: {
    position: "absolute",
  },

  // center screen
  centerScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // ios header
  iosHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : 0,
  },

  //iOS SystemMessage Date Label
  iosDateLabel: {
    backgroundColor: "#ffffff",
    color: colorAlpha("#000000").shade50,
    fontWeight: "bold",
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
    overflow: "hidden",
  },
});
