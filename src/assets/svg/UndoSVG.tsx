import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const UndoSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <Path d="M12 5c-3.86 0-7 3.14-7 7H3l4 4 4-4H7c0-2.76 2.24-5 5-5 1.38 0 2.63.56 3.54 1.46.39.39 1.02.39 1.41 0 .39-.39.39-1.03 0-1.42C15.63 5.79 13.89 5 12 5z" />
    </Svg>
  );
};

export default UndoSVG;
