import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const RotateSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Isolation Mode"
      viewBox="0 0 24 24"
      width={16}
      height={16}
      {...props}
    >
      <Path d="M12 2.99a9.03 9.03 0 016.36 2.65l-2.374 2.374h5.83a1.146 1.146 0 001.146-1.146v-5.83l-2.491 2.491A11.98 11.98 0 000 12h2.99A9.02 9.02 0 0112 2.99zM21.01 12a8.994 8.994 0 01-15.37 6.36l2.374-2.374H1.993a.956.956 0 00-.955.955v6.021l2.491-2.491A11.98 11.98 0 0024 12z" />
    </Svg>
  );
};
