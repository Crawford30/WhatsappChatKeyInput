import * as React from "react";
import Svg, { Path, G } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: style */

export const AssessSVG = (props: any) => {
  return (
    <Svg
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 48 48"
      xmlSpace="preserve"
      enableBackground="new 0 0 48 48"
      {...props}
    >
      <Path
        fill="currentColor"
        opacity={0.3}
        d="M8.5 7.7L2 5.2 8.5 2.6 14.9 5.2z"
      />
      <Path
        fill="currentColor"
        opacity={0.6}
        d="M8.5 7.7L8.5 45.4 8.4 45.4 2 42.9 2 5.2z"
      />
      <Path fill="currentColor" d="M8.5 45.4L14.9 42.9 14.9 5.2 8.5 7.7z" />
      <G>
        <Path
          fill="currentColor"
          opacity={0.3}
          d="M24.2 26L17.7 23.5 24.1 20.9 30.6 23.5z"
        />
        <Path
          fill="currentColor"
          opacity={0.6}
          d="M24.1 26L24.1 45.4 24 45.4 17.7 42.9 17.7 23.5z"
        />
        <Path fill="currentColor" d="M24.1 45.4L30.6 42.9 30.6 23.5 24.2 26z" />
      </G>
      <G>
        <Path
          fill="currentColor"
          opacity={0.3}
          d="M39.6 16.9L33.1 14.3 39.5 11.8 46 14.3z"
        />
        <Path
          fill="currentColor"
          opacity={0.6}
          d="M39.5 16.9L39.5 45.4 39.5 45.4 33.1 42.9 33.1 14.3z"
        />
        <Path fill="currentColor" d="M39.5 45.4L46 42.9 46 14.3 39.6 16.9z" />
      </G>
    </Svg>
  );
};
