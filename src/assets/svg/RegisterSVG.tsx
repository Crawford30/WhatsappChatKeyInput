import * as React from "react";
import Svg, { Path } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: style */

export const RegisterSVG = (props: any) => {
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
        d="M12 9.6l-1-.1c-3.2-.4-6.8 1.7-7.1 4.8.2-1.7 1.7-2.8 3.4-2.6l4.7.5V9.6zM32 14.3l6.3.9c1.9.2 3.4 1.9 3.4 3.8v20.8c0 1.8-1.3 3.1-3.1 3.1 3.2.1 5.7-2.5 5.7-5.8V19.4c0-3.3-2.7-6.4-6.1-6.8l-6.5-.9"
      />
      <Path
        fill="currentColor"
        d="M39.8 21.3c0-.5 0-1.1-.1-1.7-.2-1.7-1.5-3.1-3.3-3.4-.9-.2-1.8-.3-2.7-.4-1.6-.2-2.9-.3-2.9-.3v-.7c0-.6-.1-1.5-.1-2.3v-.4c-.1-2.7-1.4-4.1-4.2-4.4-3.3-.4-6.5-.8-9.8-1.1-2.6-.3-4 .9-4.1 3.4v3.3c-1.7-.2-3.3-.4-4.9-.6-2.8-.3-4.1.9-4.1 3.7v18.7c0 2.9 1.3 4.4 4.3 4.8C17 41 26.1 42 35.3 43.1c3.3.4 4.5-.7 4.5-4V21.3zm-23.6-8.4v-2.3-.3c3.7.4 7.3.8 10.9 1.3V15.2l-2.7-.3c-2.4-.3-4.8-.6-7.2-.8-.6-.1-.9-.3-1-.8v-.4zm.1 6.6l-3.6-.4v-5.5l3.6.4v5.5zm14.4 1.7l-3.6-.4v-5.5l3.6.4v5.5zM38.4 36c-.5-.1-24.5-3-33.4-4v-3.8s32.8 4 33.4 4M15.1 5.4l15.3 1.7-4-1.7c-1.4-.6-2.8-.8-4.3-.7l-7 .7z"
      />
    </Svg>
  );
};
