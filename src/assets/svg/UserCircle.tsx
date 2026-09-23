import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const UserCircleSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="currentColor"
      {...props}
    >
      <Path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zM8 21.164V21c0-2.206 1.794-4 4-4s4 1.794 4 4v.164c-1.226.537-2.578.836-4 .836s-2.774-.299-4-.836zm9.925-1.113C17.469 17.192 14.986 15 12 15s-5.468 2.192-5.925 5.051A9.993 9.993 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10a9.993 9.993 0 01-4.075 8.051zM12 5C9.794 5 8 6.794 8 9s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z" />
    </Svg>
  );
};
