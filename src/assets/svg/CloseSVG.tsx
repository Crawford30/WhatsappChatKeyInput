import Svg, { Path } from "react-native-svg";

export const CloseSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      {...props}
    >
      <Path d="M14.121 12L18 8.117A1.5 1.5 0 0015.883 6L12 9.879 8.11 5.988A1.5 1.5 0 105.988 8.11L9.879 12 6 15.882A1.5 1.5 0 108.118 18L12 14.121 15.878 18A1.5 1.5 0 0018 15.878z" />
    </Svg>
  );
};
