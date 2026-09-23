import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const PlayIconSVG = (props: any) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M8 5v14l11-7z" fill={CURRENT_COLOR || "#000"} {...props} />
    </Svg>
  );
};
