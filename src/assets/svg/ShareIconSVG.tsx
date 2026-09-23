import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const ShareIconSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      fill={CURRENT_COLOR || "#ffffff"}
      {...props}
    >
      <Path d="M19.333 14.667a4.66 4.66 0 00-3.839 2.024l-6.509-2.939a4.574 4.574 0 00.005-3.488l6.5-2.954a4.66 4.66 0 10-.827-2.643 4.633 4.633 0 00.08.786l-6.91 3.14a4.668 4.668 0 10-.015 6.827l6.928 3.128a4.736 4.736 0 00-.079.785 4.667 4.667 0 104.666-4.666zm0-12.667a2.667 2.667 0 11-2.666 2.667A2.669 2.669 0 0119.333 2zM4.667 14.667A2.667 2.667 0 117.333 12a2.67 2.67 0 01-2.666 2.667zM19.333 22A2.667 2.667 0 1122 19.333 2.669 2.669 0 0119.333 22z" />
    </Svg>
  );
};
