import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const StickerSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M18 2H6a4 4 0 00-4 4v12a4 4 0 004 4h8.17a3 3 0 002.12-.88l4.83-4.83A3 3 0 0022 14.17V6a4 4 0 00-4-4zM4 18V6a2 2 0 012-2h12a2 2 0 012 2v7h-3a5 5 0 00-5 5v2H6a2 2 0 01-2-2zm10 1.59V18a3 3 0 013-3h1.59z" />
    </Svg>
  );
};
