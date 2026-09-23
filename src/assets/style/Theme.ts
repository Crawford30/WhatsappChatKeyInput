import { MD3LightTheme as DefaultTheme } from "react-native-paper";

import {
  colorAlpha,
  configColor,
  configSecondary,
  configTertiary,
} from "./Colors";

export const theme = {
  colors: {
    primary: configColor,
    secondary: configSecondary,
    tertiary: configTertiary,
  },
};

export const themePaper = {
  // ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: configColor,
    outline: configColor,
    backdrop: colorAlpha("#000000").shade50,
    // secondaryContainer: configColor,
  },
  roundness: 2,
};
