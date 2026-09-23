import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const BadgeSVG = (props: any) => {
  return (
    <Svg
      height={24}
      viewBox="0 0 24 24"
      width={24}
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      {...props}
    >
      <Path d="M20 8a8 8 0 10-14 5.274V21.5a2.5 2.5 0 004.062 1.952L12 21.9l1.938 1.55A2.5 2.5 0 0018 21.5v-8.226A7.957 7.957 0 0020 8zm-8-6a6 6 0 11-6 6 6.006 6.006 0 016-6zm3.717 19.948a.491.491 0 01-.529-.06L12 19.337l-3.187 2.551A.5.5 0 018 21.5v-6.582a7.935 7.935 0 008 0V21.5a.487.487 0 01-.283.448z" />
    </Svg>
  );
};
