import Svg, { Path } from "react-native-svg";

export const HomeSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={18}
      height={18}
      fill="currentColor"
      {...props}
    >
      <Path d="M22 5.724V2a1 1 0 10-2 0v2.366L14.797.855a4.98 4.98 0 00-5.594 0l-7 4.724A4.995 4.995 0 000 9.724V19c0 2.757 2.243 5 5 5h3a1 1 0 001-1v-8c0-.551.448-1 1-1h4c.552 0 1 .449 1 1v8a1 1 0 001 1h3c2.757 0 5-2.243 5-5V9.724a4.995 4.995 0 00-2-4zM22 19c0 1.654-1.346 3-3 3h-2v-7c0-1.654-1.346-3-3-3h-4c-1.654 0-3 1.346-3 3v7H5c-1.654 0-3-1.346-3-3V9.724c0-.999.494-1.929 1.322-2.487l7-4.724a2.985 2.985 0 013.355 0l7 4.724a2.995 2.995 0 011.322 2.487V19z" />
    </Svg>
  );
};
