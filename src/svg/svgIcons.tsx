import * as React from 'react';
import Svg, { Path, Circle, Polyline, Line, Rect } from 'react-native-svg';

const COLOR = '#FFFFFF';
const LOCK_COLOR = '#00A884';
const DELETE_COLOR = '#FF3B30';
const PAUSE_COLOR = '#FF9500';

export const MicrophoneSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || COLOR}
      {...props}>
      <Path d="M42.1 22.5c0 9-6.5 16.4-15.1 17.9v3.3c0 1.7-1.3 3-3 3s-3-1.4-3-3v-3.3C12.4 39 5.9 31.5 5.9 22.5c0-1.7 1.3-3 3-3s3 1.4 3 3c0 6.7 5.4 12.1 12.1 12.1s12.1-5.4 12.1-12.1c0-1.7 1.3-3 3-3s3 1.3 3 3zm-24.1 0V7.4c0-3.3 2.7-6 6-6s6 2.7 6 6v15.1c0 3.3-2.7 6-6 6s-6-2.7-6-6z" />
    </Svg>
  );
};

export const SendSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      data-name="Layer 1"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill={props.fill || COLOR}
      {...props}>
      <Path d="M4.034.282A2.824 2.824 0 00.893.749C.054 1.521-.22 2.657.18 3.717l4.528 8.288-4.444 8.283a2.683 2.683 0 00.719 2.966 2.78 2.78 0 001.887.734c.441 0 .895-.102 1.332-.312l19.769-11.678L4.034.282zM2.032 2.958a.703.703 0 01.214-.736.82.82 0 01.895-.149l15.185 8.928H6.438L2.032 2.958zm1.229 18.954a.82.82 0 01-.928-.134.705.705 0 01-.214-.737L6.443 13h11.898l-15.08 8.912z" />
    </Svg>
  );
};

export const DeleteSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || DELETE_COLOR}
      {...props}>
      <Path d="M12 38c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V14H12v24zM38 8h-7l-2-2H19l-2 2h-7v4h28V8z" />
    </Svg>
  );
};

export const PauseSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || PAUSE_COLOR}
      {...props}>
      <Path d="M12 8c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4s4-1.8 4-4V12c0-2.2-1.8-4-4-4zm24 0c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4s4-1.8 4-4V12c0-2.2-1.8-4-4-4z" />
    </Svg>
  );
};

export const PlaySVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || COLOR}
      {...props}>
      <Path d="M12 8v32l20-16z" />
    </Svg>
  );
};

export const LockSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || LOCK_COLOR}
      {...props}>
      <Path d="M36 14h-2V10c0-4.4-3.6-8-8-8s-8 3.6-8 8v4h-2c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4zm-10-4c2.2 0 4 1.8 4 4v4h-8v-4c0-2.2 1.8-4 4-4zm6 24c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" />
    </Svg>
  );
};

export const EmojiSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={24}
      height={24}
      fill={props.fill || '#999999'}
      {...props}>
      <Circle
        cx="24"
        cy="24"
        r="21"
        fill="none"
        stroke={props.fill || '#999999'}
        strokeWidth="2"
      />
      <Circle cx="18" cy="20" r="2" fill={props.fill || '#999999'} />
      <Circle cx="30" cy="20" r="2" fill={props.fill || '#999999'} />
      <Path
        d="M16 28c2 2 4 3 8 3s6-1 8-3"
        stroke={props.fill || '#999999'}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
};

// --- Aliases & New Icons ---

export const EmojiIcon = EmojiSVG;

export const KeyboardIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Rect
      x="4"
      y="12"
      width="40"
      height="24"
      rx="3"
      stroke={props.fill || '#999999'}
      strokeWidth="2"
      fill="none"
    />
    <Rect
      x="10"
      y="19"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="18"
      y="19"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="26"
      y="19"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="34"
      y="19"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="10"
      y="26"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="18"
      y="26"
      width="12"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
    <Rect
      x="34"
      y="26"
      width="4"
      height="3"
      rx="1"
      fill={props.fill || '#999999'}
    />
  </Svg>
);

export const AttachIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Path
      d="M40 22L22 40a12 12 0 01-17-17L23 5a8 8 0 0111 11L16 34a4 4 0 01-6-6L28 10"
      stroke={props.fill || '#999999'}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CameraIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Path
      d="M46 38a4 4 0 01-4 4H6a4 4 0 01-4-4V18a4 4 0 014-4h6l4-6h8l4 6h12a4 4 0 014 4v20z"
      stroke={props.fill || '#999999'}
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />
    <Circle
      cx="24"
      cy="28"
      r="7"
      stroke={props.fill || '#999999'}
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const SendIcon = SendSVG;
export const TrashIcon = DeleteSVG;
export const LockIcon = LockSVG;
export const PauseIcon = PauseSVG;
export const PlayIcon = PlaySVG;

export const CheckIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width={24}
    height={24}
    fill="none"
    {...props}>
    <Path
      d="M8 24l10 10L40 14"
      stroke={props.fill || COLOR}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
