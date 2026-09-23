import Svg, { Path } from "react-native-svg";

export const UploadSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="currentColor"
      {...props}
    >
      <Path d="M16 12v2c0 1.103-.897 2-2 2h-4c-1.103 0-2-.897-2-2v-2H0v9c0 1.654 1.346 3 3 3h18c1.654 0 3-1.346 3-3v-9h-8zm6 9a1 1 0 01-1 1H3a1 1 0 01-1-1v-7h4c0 2.206 1.794 4 4 4h4c2.206 0 4-1.794 4-4h4v7zM8.707 5.293L7.293 3.879 10.586.586a2.003 2.003 0 012.828 0l3.293 3.293-1.414 1.414L13 3v8h-2V3L8.707 5.293z" />
    </Svg>
  );
};
