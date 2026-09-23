import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";

export const ImageSVG = (props: any) => {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      {...props}
    >
      <Path d="M11.122 12.536a3 3 0 00-4.244 0l-6.84 6.84A4.991 4.991 0 005 24h14a4.969 4.969 0 002.753-.833z" />
      <Circle cx={18} cy={6} r={2} />
      <Path d="M19 0H5a5.006 5.006 0 00-5 5v11.586l5.464-5.464a5 5 0 017.072 0l10.631 10.631A4.969 4.969 0 0024 19V5a5.006 5.006 0 00-5-5zm-1 10a4 4 0 114-4 4 4 0 01-4 4z" />
    </Svg>
  );
};
