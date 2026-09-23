import * as React from "react";
import Svg, { Path } from "react-native-svg";
import { CURRENT_COLOR } from "../../utils";

export const AddUserSVG = (props: any) => {
  return (
    <Svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={CURRENT_COLOR}
      {...props}
    >
      <Path d="M23 11h-2V9a1 1 0 00-2 0v2h-2a1 1 0 000 2h2v2a1 1 0 002 0v-2h2a1 1 0 000-2zM9 12a6 6 0 10-6-6 6.006 6.006 0 006 6zM9 2a4 4 0 11-4 4 4 4 0 014-4zM9 14a9.01 9.01 0 00-9 9 1 1 0 002 0 7 7 0 0114 0 1 1 0 002 0 9.01 9.01 0 00-9-9z" />
    </Svg>
  );
};
