import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const LocationSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M21.949 11C21.478 6.283 17.717 2.521 13 2.051V0h-2v2.051C6.283 2.521 2.521 6.283 2.051 11H0v2h2.051c.471 4.717 4.232 8.479 8.949 8.949V24h2v-2.051c4.717-.471 8.479-4.232 8.949-8.949H24v-2h-2.051zM12 17c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm3-5c0 1.654-1.346 3-3 3s-3-1.346-3-3 1.346-3 3-3 3 1.346 3 3z" />
    </Svg>
  );
};
