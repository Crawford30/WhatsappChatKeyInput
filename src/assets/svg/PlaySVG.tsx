import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const PlaySVG = (props: any) => {
  return (
    <Svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      {...props}
    >
      <Path
        fill={props.fill || CURRENT_COLOR || "white"}
        d="M20.426 10.098c-1.231-1.446-3.415-3.622-6.832-5.78-2.81-1.774-5.311-2.716-6.915-3.194a2.935 2.935 0 00-2.612.464 2.941 2.941 0 00-1.193 2.377v16.07c0 .945.436 1.811 1.193 2.377a2.94 2.94 0 002.613.464c1.604-.478 4.105-1.42 6.915-3.194 3.417-2.158 5.601-4.334 6.832-5.78a2.924 2.924 0 000-3.805z"
        opacity={1}
      />
    </Svg>
  );
};
