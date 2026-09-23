import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {CURRENT_COLOR} from '../../utils';

export const ForwardSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={512}
      height={512}
      fill={CURRENT_COLOR}
      {...props}>
      <Path d="M0 23v-7a9.01 9.01 0 019-9h4.83V5.414A2 2 0 0117.244 4l5.88 5.879a3 3 0 010 4.242L17.244 20a2 2 0 01-3.414-1.414V17H8a6.006 6.006 0 00-6 6 1 1 0 01-2 0zM15.83 8a1 1 0 01-1 1H9a7.008 7.008 0 00-7 7v1.714A7.984 7.984 0 018 15h6.83a1 1 0 011 1v2.586l5.879-5.879a1 1 0 000-1.414L15.83 5.414z" />
    </Svg>
  );
};
