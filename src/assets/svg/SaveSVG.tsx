import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const SaveIconSVG = (props: any) => {
    return (
      <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={24} height={24} {...props}>
        <Path
          d="M19 21H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10l6 6v10c0 1.1-.9 2-2 2z"
          fill="#000"
        />
        <Path
          d="M17 21v-8H7v8M7 3v4h8V3H7z"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };