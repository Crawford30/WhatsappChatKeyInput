import Svg, { Path } from "react-native-svg";

export const ColumnsSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      {...props}
    >
      <Path d="M9 2h6v20H9V2zm10 0h-2v20h2c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5zM7 2H5C2.243 2 0 4.243 0 7v10c0 2.757 2.243 5 5 5h2V2z" />
    </Svg>
  );
};
