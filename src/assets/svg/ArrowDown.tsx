import Svg, { Path } from "react-native-svg";

export const ArrowDown = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      {...props}
    >
      <Path
        d="M12 15.5a1.993 1.993 0 01-1.414-.585L5.293 9.621l1.414-1.414L12 13.5l5.293-5.293 1.414 1.414-5.293 5.293A1.993 1.993 0 0112 15.5z"
        data-name="01 align center"
      />
    </Svg>
  );
};
