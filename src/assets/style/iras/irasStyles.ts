import { StyleSheet } from "react-native";

const primaryColor = "#AF3E4D";
const dimWhite = "#f2f2f2";

export const irasStyles = StyleSheet.create({
  heading: {
    fontSize: 30,
    fontWeight: "900",
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

  // text size
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

  // radius
  radius5: {
    borderRadius: 5,
  },
  radius10: {
    borderRadius: 10,
  },
  radius15: {
    borderRadius: 15,
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
    borderColor: primaryColor,
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
});
