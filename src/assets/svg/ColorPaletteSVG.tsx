import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const ColorPaletteSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <Path d="M12 2C6.48 2 2 6.02 2 11c0 4.2 3.22 7 7.5 7h.5v1.5c0 1.1.9 2 2 2h1c1.38 0 2.5-1.12 2.5-2.5v-.55c0-.42.35-.76.77-.76 2.86-.13 5.73-2.04 5.73-5.19C22 6.02 17.52 2 12 2zm-4 10c-.83 0-1.5-.67-1.5-1.5S7.17 9 8 9s1.5.67 1.5 1.5S8.83 12 8 12zm4-2c-.83 0-1.5-.67-1.5-1.5S11.17 7 12 7s1.5.67 1.5 1.5S12.83 10 12 10zm4 2c-.83 0-1.5-.67-1.5-1.5S15.17 9 16 9s1.5.67 1.5 1.5S16.83 12 16 12z" />
    </Svg>
  );
};

export default ColorPaletteSVG;
