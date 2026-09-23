import color from "color";

// colors
export const primaryColor = "#1b75bb";
export const secondaryColor = "#3a53a5";
export const dimWhite = "#f2f2f2";
export const configColor = "#1b75bb";
export const configSecondary = "#747474";
export const configTertiary = "#f9dd8b";

// iras colors
export const PRIMARY_COLOR_IRAS = "#AF3E4D";

export const colorAlpha = (colorCode: string) => {
  const getColor = (shade: number) =>
    color(colorCode).alpha(shade).rgb().string();

  let shades = {
    shade5: getColor(0.05),
    shade10: getColor(0.1),
    shade15: getColor(0.15),
    shade20: getColor(0.2),
    shade30: getColor(0.3),
    shade40: getColor(0.4),
    shade50: getColor(0.5),
    shade60: getColor(0.6),
    shade70: getColor(0.7),
    shade80: getColor(0.8),
    shade90: getColor(0.9),
  };
  return shades;
};
