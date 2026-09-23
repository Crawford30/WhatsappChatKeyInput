import {CURRENT_COLOR} from '../../utils';
import Svg, {Path} from 'react-native-svg';

export const CopySVG = (props: any) => {
  return (
    <Svg
      fill={CURRENT_COLOR}
      viewBox="0 0 24 24"
      height={24}
      width={24}
      data-name="Layer 1"
      {...props}>
      <Path d="M13 4a1 1 0 001 1h3.966a2.981 2.981 0 00-.811-1.728L14.871.913A3.011 3.011 0 0013 .029zm-2 0V0H7a5.006 5.006 0 00-5 5v10a5.006 5.006 0 005 5h6a5.006 5.006 0 005-5V7h-4a3 3 0 01-3-3zm6 20H8a1 1 0 010-2h9a3 3 0 003-3V8a1 1 0 012 0v11a5.006 5.006 0 01-5 5z" />
    </Svg>
  );
};
