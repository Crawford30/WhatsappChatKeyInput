import Svg, { Path } from "react-native-svg";

export const CheckCircleSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      {...props}
    >
      <Path d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-.091 15.419a2.001 2.001 0 01-2.823-.005l-2.782-2.696 1.393-1.437 2.793 2.707 5.809-5.701 1.404 1.425-5.793 5.707z" />
    </Svg>
  );
};
