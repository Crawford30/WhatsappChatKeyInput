import React, { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import {
  CropHandle,
  CropRect,
  dragCrop,
} from '../../Helpers/imageEditGeometry';

const HANDLE_HIT = 36;
const CORNER = 22;
const CORNER_THICKNESS = 4;

interface CropOverlayProps {
  width: number;
  height: number;
  crop: CropRect;
  onChange: (crop: CropRect) => void;
}

/** Crop frame over the uncropped image: drag corners to resize, inside to move */
export const CropOverlay: React.FC<CropOverlayProps> = props => {
  const { width, height, crop } = props;
  const latest = useRef(props);
  latest.current = props;
  const gesture = useRef<{ handle: CropHandle | null; start: CropRect }>({
    handle: null,
    start: crop,
  });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        const { crop: c, width: w, height: h } = latest.current;
        const { locationX: x, locationY: y } = event.nativeEvent;
        const left = c.x * w;
        const top = c.y * h;
        const right = (c.x + c.w) * w;
        const bottom = (c.y + c.h) * h;
        const near = (a: number, b: number) => Math.abs(a - b) < HANDLE_HIT;

        let handle: CropHandle | null = null;
        if (near(x, left) && near(y, top)) handle = 'tl';
        else if (near(x, right) && near(y, top)) handle = 'tr';
        else if (near(x, left) && near(y, bottom)) handle = 'bl';
        else if (near(x, right) && near(y, bottom)) handle = 'br';
        else if (x > left && x < right && y > top && y < bottom) {
          handle = 'move';
        }
        gesture.current = { handle, start: c };
      },
      onPanResponderMove: (_, state) => {
        const { handle, start } = gesture.current;
        const { width: w, height: h, onChange } = latest.current;
        if (handle)
          onChange(dragCrop(start, handle, state.dx / w, state.dy / h));
      },
    })
  ).current;

  const frame = {
    left: crop.x * width,
    top: crop.y * height,
    width: crop.w * width,
    height: crop.h * height,
  };

  const corner = (vertical: 'top' | 'bottom', horizontal: 'left' | 'right') => (
    <View
      key={`${vertical}-${horizontal}`}
      style={[
        styles.corner,
        {
          [vertical]: -1,
          [horizontal]: -1,
          [`border${vertical === 'top' ? 'Top' : 'Bottom'}Width`]:
            CORNER_THICKNESS,
          [`border${horizontal === 'left' ? 'Left' : 'Right'}Width`]:
            CORNER_THICKNESS,
        },
      ]}
    />
  );

  return (
    <View style={StyleSheet.absoluteFill} {...responder.panHandlers}>
      {/* Visuals ignore touches so locationX/Y stay relative to the canvas */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Dim everything outside the frame */}
        <View
          style={[styles.dim, { left: 0, right: 0, top: 0, height: frame.top }]}
        />
        <View
          style={[
            styles.dim,
            { left: 0, right: 0, top: frame.top + frame.height, bottom: 0 },
          ]}
        />
        <View
          style={[
            styles.dim,
            {
              left: 0,
              width: frame.left,
              top: frame.top,
              height: frame.height,
            },
          ]}
        />
        <View
          style={[
            styles.dim,
            {
              left: frame.left + frame.width,
              right: 0,
              top: frame.top,
              height: frame.height,
            },
          ]}
        />

        <View style={[styles.frame, frame]}>
          {[1, 2].map(i => (
            <View
              key={`v${i}`}
              style={[styles.gridV, { left: `${(i * 100) / 3}%` }]}
            />
          ))}
          {[1, 2].map(i => (
            <View
              key={`h${i}`}
              style={[styles.gridH, { top: `${(i * 100) / 3}%` }]}
            />
          ))}
          {corner('top', 'left')}
          {corner('top', 'right')}
          {corner('bottom', 'left')}
          {corner('bottom', 'right')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dim: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  frame: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: 'white',
  },
});
