import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const GallerySVG = (props: any) => {
  return (
    <Svg
      fill={CURRENT_COLOR}
      height={512}
      viewBox="0 0 24 24"
      width={512}
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      {...props}
    >
      <Path d="M19 0h-6a5.006 5.006 0 00-5 5v.1A5.009 5.009 0 004 10v.1A5.009 5.009 0 000 15v4a5.006 5.006 0 005 5h6a5.006 5.006 0 005-5v-.1a5.009 5.009 0 004-4.9v-.1A5.009 5.009 0 0024 9V5a5.006 5.006 0 00-5-5zM2 15a3 3 0 013-3h6a2.988 2.988 0 012.638 1.6l-3.455 3.463-.475-.479A1.992 1.992 0 007 16.473l-4.621 3.96A2.96 2.96 0 012 19zm12 4a3 3 0 01-3 3H5a2.971 2.971 0 01-1.118-.221L8.288 18l.476.481a2 2 0 002.828 0L14 16.068zm4-5a3 3 0 01-2 2.816V15a5.006 5.006 0 00-5-5H6a3 3 0 013-3h6a3 3 0 013 3zm4-5a3 3 0 01-2 2.816V10a5.006 5.006 0 00-5-5h-5a3 3 0 013-3h6a3 3 0 013 3zM4 15a1 1 0 111 1 1 1 0 01-1-1z" />
    </Svg>
  );
};
