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
      viewBox="0 0 48 48"
      fill={props.fill || COLOR}
      {...props}>
      <Path d="M6 6l36 18L6 42V28l24-4L6 20z" />
    </Svg>
  );
};

export const DeleteSVG = (props: any) => {
  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
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

// --- New Icons ---

export const EmojiIcon = EmojiSVG;

export const KeyboardIcon = (props: any) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
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

// import * as React from 'react';
// import Svg, { Path, Circle } from 'react-native-svg';

// const COLOR = '#FFFFFF';
// const LOCK_COLOR = '#00A884';
// const DELETE_COLOR = '#FF3B30';
// const PAUSE_COLOR = '#FF9500';

// export const MicrophoneSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || COLOR}
//       {...props}>
//       <Path d="M42.1 22.5c0 9-6.5 16.4-15.1 17.9v3.3c0 1.7-1.3 3-3 3s-3-1.4-3-3v-3.3C12.4 39 5.9 31.5 5.9 22.5c0-1.7 1.3-3 3-3s3 1.4 3 3c0 6.7 5.4 12.1 12.1 12.1s12.1-5.4 12.1-12.1c0-1.7 1.3-3 3-3s3 1.3 3 3zm-24.1 0V7.4c0-3.3 2.7-6 6-6s6 2.7 6 6v15.1c0 3.3-2.7 6-6 6s-6-2.7-6-6z" />
//     </Svg>
//   );
// };

// export const SendSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || COLOR}
//       {...props}>
//       <Path d="M16.6915026,32.4744748 L3.50612381,13.2599618 C3.19218622,12.8027196 3.03521743,12.2254528 3.15213458,11.6694503 C3.26905173,11.1134477 3.65217489,10.6563168 4.13399899,10.4744748 L41.1272231,0.518620237 C41.8231504,0.281155625 42.5853321,0.443792159 43.1076gibralta,0.943451096 C43.6299821,1.44311005 43.8573899,2.20527183 43.7121271,2.9560924 L32.6563168,42.3319027 C32.4744748,43.0274994 31.9831052,43.5757269 31.3071995,43.7974122 C30.6312938,44.0190975 29.8916942,43.9052101 29.2885953,43.4828104 L21.3303271,37.0151496 L13.5612381,44.5864873 C12.8034622,45.3029667 11.5359288,45.3029667 10.778153,44.5864873 C10.0203771,43.8700079 10.0203771,42.6294645 10.778153,41.9129851 L18.6363212,34.3416474 L3.03521743,34.3416474 C2.15151726,34.3416474 1.44311005,33.6332402 1.44311005,32.75 C1.44311005,31.8667598 2.15151726,31.1583526 3.03521743,31.1583526 L18.6363212,31.1583526 L10.778153,24.6906918 C10.0203771,23.9742124 10.0203771,22.733669 10.778153,22.0171896 C11.5359288,21.3007102 12.8034622,21.3007102 13.5612381,22.0171896 L21.3303271,29.5885273 L29.2885953,23.1208665 C29.8916942,22.6984668 30.6312938,22.5845794 31.3071995,22.8062647 C31.9831052,23.02795 32.4744748,23.5761775 32.6563168,24.2717742 L43.7121271,63.6475845 C43.8573899,64.3984051 43.6299821,65.1605669 43.1076gibralta,65.6601558 C42.5853321,66.1597448 41.8231504,66.3223813 41.1272231,66.084916 L4.13399899,56.1290603 C3.65217489,55.9472183 3.26905173,55.4900875 3.15213458,54.9340849 C3.03521743,54.3780824 3.19218622,53.8008156 3.50612381,53.3435734 L16.6915026,34.1290603 C17.1824901,33.5772706 17.1824901,32.5262645 16.6915026,31.9744748 Z" />
//     </Svg>
//   );
// };

// export const DeleteSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || DELETE_COLOR}
//       {...props}>
//       <Path d="M12 38c0 2.2 1.8 4 4 4h16c2.2 0 4-1.8 4-4V14H12v24zM38 8h-7l-2-2H19l-2 2h-7v4h28V8z" />
//     </Svg>
//   );
// };

// export const PauseSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || PAUSE_COLOR}
//       {...props}>
//       <Path d="M12 8c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4s4-1.8 4-4V12c0-2.2-1.8-4-4-4zm24 0c-2.2 0-4 1.8-4 4v24c0 2.2 1.8 4 4 4s4-1.8 4-4V12c0-2.2-1.8-4-4-4z" />
//     </Svg>
//   );
// };

// export const PlaySVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || COLOR}
//       {...props}>
//       <Path d="M12 8v32l20-16z" />
//     </Svg>
//   );
// };

// export const LockSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || LOCK_COLOR}
//       {...props}>
//       <Path d="M36 14h-2V10c0-4.4-3.6-8-8-8s-8 3.6-8 8v4h-2c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h20c2.2 0 4-1.8 4-4V18c0-2.2-1.8-4-4-4zm-10-4c2.2 0 4 1.8 4 4v4h-8v-4c0-2.2 1.8-4 4-4zm6 24c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2v-6c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v6z" />
//     </Svg>
//   );
// };

// export const EmojiSVG = (props: any) => {
//   return (
//     <Svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 48 48"
//       fill={props.fill || '#999999'}
//       {...props}>
//       <Circle
//         cx="24"
//         cy="24"
//         r="21"
//         fill="none"
//         stroke={props.fill || '#999999'}
//         strokeWidth="2"
//       />
//       <Circle cx="18" cy="20" r="2" fill={props.fill || '#999999'} />
//       <Circle cx="30" cy="20" r="2" fill={props.fill || '#999999'} />
//       <Path
//         d="M16 28c2 2 4 3 8 3s6-1 8-3"
//         stroke={props.fill || '#999999'}
//         strokeWidth="2"
//         fill="none"
//         strokeLinecap="round"
//       />
//     </Svg>
//   );
// };
