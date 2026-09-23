import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const ArrowSquareSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M20 11v8c0 2.757-2.243 5-5 5H5c-2.757 0-5-2.243-5-5V9c0-2.757 2.243-5 5-5h8a1 1 0 010 2H5C3.346 6 2 7.346 2 9v10c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-8a1 1 0 012 0zm1-11h-7a1 1 0 000 2h6.586L8.293 14.293a.999.999 0 101.414 1.414L22 3.414V10a1 1 0 002 0V3c0-1.654-1.346-3-3-3z" />
    </Svg>
  );
};
