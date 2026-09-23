import * as React from 'react';
import Svg, {Path} from 'react-native-svg';
import {CURRENT_COLOR} from '../../utils';

export const CopyDataSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      fill={CURRENT_COLOR}
      {...props}>
      <Path d="M14.5 21c2.481 0 4.5-2.019 4.5-4.5V7.157a4.47 4.47 0 00-1.318-3.182l-2.657-2.657A4.469 4.469 0 0011.843 0H6.5A4.505 4.505 0 002 4.5v12C2 18.981 4.019 21 6.5 21h8zm2.475-16.318c.377.377.645.829.816 1.318H14c-.551 0-1-.449-1-1V1.209c.489.171.941.439 1.318.816l2.657 2.657zM3 16.5v-12C3 2.57 4.57 1 6.5 1h5.343c.053 0 .104.013.157.015V5c0 1.103.897 2 2 2h3.985c.002.053.015.104.015.157V16.5c0 1.93-1.57 3.5-3.5 3.5h-8C4.57 20 3 18.43 3 16.5zm19-8v11c0 2.481-2.019 4.5-4.5 4.5h-12a.5.5 0 010-1h12c1.93 0 3.5-1.57 3.5-3.5v-11a.5.5 0 011 0z" />
    </Svg>
  );
};
