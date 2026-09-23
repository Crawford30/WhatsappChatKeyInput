import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const HeadphonesSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M12 3a9 9 0 00-9 9v7c0 1.1.9 2 2 2h1a2 2 0 002-2v-4a2 2 0 00-2-2H5v-1a7 7 0 0114 0v1h-1a2 2 0 00-2 2v4a2 2 0 002 2h1c1.1 0 2-.9 2-2v-7a9 9 0 00-9-9z" />
    </Svg>
  );
};
