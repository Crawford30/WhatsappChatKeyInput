import Svg, { Path } from "react-native-svg";


export const NotificationSVG = (props: any) => {
    return <Svg
    width={20}
    height={20}
    viewBox="0 0 64 64"
    xmlSpace="preserve"
    fill="currentColor"
    {...props}
  >
    <Path d="M56 44c-1.832 0-4-2.168-4-4V20C52 8.973 43.027 0 32 0S12 8.973 12 20v20c0 1.793-2.207 4-4 4-2.211 0-4 1.789-4 4s1.789 4 4 4h48c2.211 0 4-1.789 4-4s-1.789-4-4-4zM32 64a8 8 0 008-8H24a8 8 0 008 8z" />
  </Svg>
}