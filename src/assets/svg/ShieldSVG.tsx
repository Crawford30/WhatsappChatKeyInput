import * as React from "react";
import Svg, { G, Path } from "react-native-svg";

export const ShieldSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24px"
      height="24px"
      fill="currentColor"
      {...props}
    >
      <G data-name="01 align center">
        <Path d="M11.948 24.009l-.354-.157C11.2 23.679 2 19.524 2 12V5.476a2.983 2.983 0 012.051-2.832L12 .009l7.949 2.635A2.983 2.983 0 0122 5.476V12c0 8.577-9.288 11.755-9.684 11.887zM12 2.106L4.684 4.532A.992.992 0 004 5.476V12c0 5.494 6.44 9.058 8.047 9.861C13.651 21.216 20 18.263 20 12V5.476a.992.992 0 00-.684-.944z" />
        <Path d="M11.111 14.542h-.033a1.872 1.872 0 01-1.345-.6l-2.306-2.4 1.441-1.382 2.244 2.34 5.181-5.181 1.414 1.414-5.261 5.261a1.873 1.873 0 01-1.335.548z" />
      </G>
    </Svg>
  );
};
