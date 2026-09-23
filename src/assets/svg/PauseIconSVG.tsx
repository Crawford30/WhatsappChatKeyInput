import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const PauseIconSVG = (props: any) => {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"
        fill={CURRENT_COLOR || "#000"}
        {...props}
      />
    </Svg>
  );
};
