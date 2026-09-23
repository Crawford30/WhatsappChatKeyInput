import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const SoundSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
      fill={CURRENT_COLOR}
    >
      <Path d="M18 17a1 1 0 01-1-1V8a1 1 0 112 0v8a1 1 0 01-1 1zm-3 6V1a1 1 0 10-2 0v22a1 1 0 102 0zm8-4V5a1 1 0 10-2 0v14a1 1 0 102 0zm-12 0V5a1 1 0 10-2 0v14a1 1 0 102 0zm-4-3V8a1 1 0 10-2 0v8a1 1 0 102 0zm-4-2v-4a1 1 0 10-2 0v4a1 1 0 102 0z" />
    </Svg>
  );
};
