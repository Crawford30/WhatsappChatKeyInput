import * as React from "react";
import Svg, { Path } from "react-native-svg";

export const BanSVG = (props: any) => {
  return (
    <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={14}
    height={14}
    {...props}
  >
    <Path
     fill={props.color || "grey"} 
     d="M12 0a12 12 0 1012 12A12.013 12.013 0 0012 0zm0 2a9.949 9.949 0 016.324 2.262L4.262 18.324A9.992 9.992 0 0112 2zm0 20a9.949 9.949 0 01-6.324-2.262L19.738 5.676A9.992 9.992 0 0112 22z" />
  </Svg>
  )
}


