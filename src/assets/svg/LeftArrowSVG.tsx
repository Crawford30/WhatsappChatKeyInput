import * as React from "react";
import Svg, { Path } from "react-native-svg";

// Left Arrow Icon
export const LeftArrowSVG = (props: any) => {
  return (
    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} {...props}>
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="#000"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};