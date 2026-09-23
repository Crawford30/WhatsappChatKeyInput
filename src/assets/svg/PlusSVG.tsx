import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const PlusSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 22 22"
      width={24}
      height={24}
      {...props}
    >
      <Path d="M17 11h-4V7a1 1 0 00-1-1 1 1 0 00-1 1v4H7a1 1 0 00-1 1 1 1 0 001 1h4v4a1 1 0 001 1 1 1 0 001-1v-4h4a1 1 0 001-1 1 1 0 00-1-1z" />
    </Svg>
  );
};
