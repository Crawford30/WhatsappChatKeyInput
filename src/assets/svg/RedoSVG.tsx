import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const RedoSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <Path d="M12 5c-1.89 0-3.63.79-4.95 2.05-.39.39-.39 1.03 0 1.42.39.39 1.02.39 1.41 0C9.37 7.56 10.62 7 12 7c2.76 0 5 2.24 5 5h-4l4 4 4-4h-2c0-3.86-3.14-7-7-7z" />
    </Svg>
  );
};

export default RedoSVG;
