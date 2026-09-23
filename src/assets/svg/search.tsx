import Svg, { Path } from "react-native-svg";


export const SearchIcon = (props: any) => {
  return (
    <Svg
      id="Outline"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      {...props}
    >
      <Path d="M23.707,22.293l-5.969-5.969a10.016,10.016,0,1,0-1.414,1.414l5.969,5.969a1,1,0,0,0,1.414-1.414ZM10,18a8,8,0,1,1,8-8A8.009,8.009,0,0,1,10,18Z" />
    </Svg>
  );
};
