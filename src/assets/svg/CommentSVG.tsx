import Svg, { Path } from "react-native-svg";

export const CommentSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={22}
      height={22}
      fill="currentColor"
      {...props}
    >
      <Path d="M24 16v8h-8a8 8 0 01-6.92-4 10.968 10.968 0 002.242-.248A5.988 5.988 0 0016 22h6v-6a5.988 5.988 0 00-2.252-4.678A10.968 10.968 0 0020 9.08 8 8 0 0124 16zm-6-7A9 9 0 000 9v9h9a9.01 9.01 0 009-9zM2 9a7 7 0 117 7H2z" />
    </Svg>
  );
};
