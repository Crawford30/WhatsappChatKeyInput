import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const CameraSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M17.721 3l-1.413-1.832A3.023 3.023 0 0013.932 0h-3.864a3.023 3.023 0 00-2.376 1.168L6.279 3z" />
      <Circle cx={12} cy={14} r={4} />
      <Path d="M19 5H5a5.006 5.006 0 00-5 5v9a5.006 5.006 0 005 5h14a5.006 5.006 0 005-5v-9a5.006 5.006 0 00-5-5zm-7 15a6 6 0 116-6 6.006 6.006 0 01-6 6z" />
    </Svg>
  );
};
