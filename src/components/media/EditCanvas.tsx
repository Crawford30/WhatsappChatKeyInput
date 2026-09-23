import React, { forwardRef, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  CanvasLayout,
  canvasDeltaToImage,
  canvasToImage,
  computeLayout,
  CropRect,
  Point,
  Rotation,
  Size,
} from '../../Helpers/imageEditGeometry';
import type { ImageEdit, Overlay, Stroke } from './editorTypes';

// Finger travel below this counts as a tap on a sticker/text
const TAP_SLOP = 6;

const toPath = (points: Point[], size: Size) =>
  points
    .map(
      (p, i) => `${i === 0 ? 'M' : 'L'}${p.x * size.width} ${p.y * size.height}`
    )
    .join(' ') +
  // A single tap still leaves a dot
  (points.length === 1
    ? ` L${points[0].x * size.width + 0.1} ${points[0].y * size.height}`
    : '');

const touchDistance = (event: GestureResponderEvent) => {
  const [a, b] = event.nativeEvent.touches;
  return a && b ? Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY) : 0;
};

interface OverlayItemProps {
  overlay: Overlay;
  layout: CanvasLayout;
  rotation: Rotation;
  interactive: boolean;
  trashTop: number;
  onChange: (id: number, patch: Partial<Overlay>) => void;
  onDelete: (id: number) => void;
  onPress: (overlay: Overlay) => void;
  onDragChange: (dragging: boolean, overTrash: boolean) => void;
}

const OverlayItem = (props: OverlayItemProps) => {
  const { overlay, layout } = props;
  const [box, setBox] = useState({ width: 0, height: 0 });

  // The responder is created once; it reads the latest props from a ref
  const latest = useRef(props);
  latest.current = props;
  const gesture = useRef({ x: 0, y: 0, size: 0, distance: 0, moved: false });

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => latest.current.interactive,
      onMoveShouldSetPanResponder: () => latest.current.interactive,
      onPanResponderGrant: () => {
        const { x, y, size } = latest.current.overlay;
        gesture.current = { x, y, size, distance: 0, moved: false };
      },
      onPanResponderMove: (event, state) => {
        const p = latest.current;
        const g = gesture.current;
        if (Math.hypot(state.dx, state.dy) > TAP_SLOP) g.moved = true;

        // Two fingers: pinch to resize
        const distance = touchDistance(event);
        if (distance) {
          if (!g.distance) {
            g.distance = distance;
            g.size = p.overlay.size;
          }
          g.moved = true;
          p.onChange(p.overlay.id, {
            size: Math.min(Math.max((g.size * distance) / g.distance, 0.03), 1),
          });
          return;
        }

        const delta = canvasDeltaToImage(
          { x: state.dx, y: state.dy },
          p.layout,
          p.rotation
        );
        p.onChange(p.overlay.id, { x: g.x + delta.x, y: g.y + delta.y });
        p.onDragChange(g.moved, state.moveY > p.trashTop);
      },
      onPanResponderRelease: (_, state) => {
        const p = latest.current;
        p.onDragChange(false, false);
        if (!gesture.current.moved) p.onPress(p.overlay);
        else if (state.moveY > p.trashTop) p.onDelete(p.overlay.id);
      },
      onPanResponderTerminate: () => latest.current.onDragChange(false, false),
    })
  ).current;

  const fontSize = overlay.size * layout.imageWidth;
  return (
    <View
      {...responder.panHandlers}
      onLayout={e =>
        setBox({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        })
      }
      style={[
        styles.overlay,
        {
          left: overlay.x * layout.imageWidth - box.width / 2,
          top: overlay.y * layout.imageHeight - box.height / 2,
          maxWidth: layout.imageWidth * 0.9,
        },
      ]}>
      <Text
        style={[
          overlay.kind === 'text' ? styles.text : null,
          { fontSize, lineHeight: fontSize * 1.2, color: overlay.color },
        ]}>
        {overlay.value}
      </Text>
    </View>
  );
};

export interface EditCanvasProps {
  uri: string;
  edit: ImageEdit;
  area: Size;
  /** Crop mode shows the uncropped image with a draft rotation */
  rotation?: Rotation;
  crop?: CropRect;
  drawing: boolean;
  drawColor: string;
  /** Pen width in display pixels */
  drawWidth: number;
  interactive: boolean;
  trashTop: number;
  onStroke: (stroke: Omit<Stroke, 'id'>) => void;
  onOverlayChange: (id: number, patch: Partial<Overlay>) => void;
  onOverlayDelete: (id: number) => void;
  onOverlayPress: (overlay: Overlay) => void;
  onOverlayDragChange: (dragging: boolean, overTrash: boolean) => void;
  onImageLoad: (size: Size) => void;
  renderOverlay?: (layout: CanvasLayout) => React.ReactNode;
}

/** The capturable canvas: image + drawings + stickers, clipped to the crop */
export const EditCanvas = forwardRef<View, EditCanvasProps>((props, ref) => {
  const {
    uri,
    edit,
    area,
    rotation = edit.rotation,
    crop = edit.crop,
    drawing,
    drawColor,
    drawWidth,
  } = props;

  const layout = computeLayout(edit.size, rotation, crop, area);
  const [draft, setDraft] = useState<Point[] | null>(null);

  const latest = useRef({ props, layout, rotation, drawColor, drawWidth });
  latest.current = { props, layout, rotation, drawColor, drawWidth };
  const points = useRef<Point[]>([]);

  const toImagePoint = (event: GestureResponderEvent) =>
    canvasToImage(
      { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY },
      latest.current.layout,
      latest.current.rotation
    );

  const drawResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: event => {
        points.current = [toImagePoint(event)];
        setDraft(points.current);
      },
      onPanResponderMove: event => {
        points.current = [...points.current, toImagePoint(event)];
        setDraft(points.current);
      },
      onPanResponderRelease: () => {
        const l = latest.current;
        if (points.current.length) {
          l.props.onStroke({
            points: points.current,
            color: l.drawColor,
            width: l.drawWidth / l.layout.imageWidth,
          });
        }
        points.current = [];
        setDraft(null);
      },
    })
  ).current;

  const size = edit.size;
  const strokes: Omit<Stroke, 'id'>[] = draft
    ? [
        ...edit.strokes,
        {
          points: draft,
          color: drawColor,
          width: drawWidth / layout.imageWidth,
        },
      ]
    : edit.strokes;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.canvas,
        { width: layout.canvasWidth, height: layout.canvasHeight },
      ]}>
      <View
        style={[
          styles.absolute,
          {
            left: layout.rotatedLeft,
            top: layout.rotatedTop,
            width: layout.rotatedWidth,
            height: layout.rotatedHeight,
          },
        ]}>
        <View
          style={[
            styles.absolute,
            {
              left: layout.imageLeft,
              top: layout.imageTop,
              width: layout.imageWidth,
              height: layout.imageHeight,
              transform: [{ rotate: `${rotation}deg` }],
            },
          ]}>
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="stretch"
            onLoad={({ nativeEvent }) =>
              props.onImageLoad({
                width: nativeEvent.source.width,
                height: nativeEvent.source.height,
              })
            }
          />
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox={`0 0 ${size.width} ${size.height}`}
            pointerEvents="none">
            {strokes.map((stroke, index) => (
              <Path
                key={index}
                d={toPath(stroke.points, size)}
                stroke={stroke.color}
                strokeWidth={stroke.width * size.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
          {edit.overlays.map(overlay => (
            <OverlayItem
              key={overlay.id}
              overlay={overlay}
              layout={layout}
              rotation={rotation}
              interactive={props.interactive}
              trashTop={props.trashTop}
              onChange={props.onOverlayChange}
              onDelete={props.onOverlayDelete}
              onPress={props.onOverlayPress}
              onDragChange={props.onOverlayDragChange}
            />
          ))}
        </View>
      </View>

      {drawing && (
        <View style={StyleSheet.absoluteFill} {...drawResponder.panHandlers} />
      )}
      {props.renderOverlay?.(layout)}
    </View>
  );
});

const styles = StyleSheet.create({
  canvas: {
    overflow: 'hidden',
  },
  absolute: {
    position: 'absolute',
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
