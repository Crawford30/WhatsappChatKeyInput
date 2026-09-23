import * as React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

// Circled "1" used for view-once media
export const ViewOnceSVG = ({ filled, ...props }: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      {...props}>
      <Circle
        cx={12}
        cy={12}
        r={9.5}
        stroke={CURRENT_COLOR}
        strokeWidth={1.8}
        strokeDasharray={filled ? undefined : "3 2"}
        fill={filled ? CURRENT_COLOR : "none"}
      />
      <Path
        d="M12.9 7.5v9h-1.7V9.6l-1.9.7V8.7l3.2-1.2z"
        fill={filled ? "white" : CURRENT_COLOR}
      />
    </Svg>
  );
};
