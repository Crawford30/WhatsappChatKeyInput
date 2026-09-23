import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export const PenSizeSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {/* Pen tip */}
      <Path d="M3 21l3-1 11-11-2-2-11 11-1 3zM14.5 6.5l2 2 2-2-2-2-2 2z" />

      {/* Dots showing pen sizes */}
      <Circle cx={19} cy={15} r={1} />
      <Circle cx={22} cy={15} r={2} />
      <Circle cx={27} cy={15} r={3} />
    </Svg>
  );
};

export default PenSizeSVG;
