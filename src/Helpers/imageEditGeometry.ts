/**
 * Geometry for the image editor.
 *
 * The editor stacks three layers inside a clipping "canvas":
 *   canvas (the crop, fitted to the screen)
 *     └ rotated layer (the whole image after rotation, offset by the crop)
 *         └ image layer (the unrotated image, rotated about its centre)
 * Drawings and stickers live in the image layer, in coordinates normalised to
 * the unrotated image (u, v in 0..1), so they follow later crops/rotations.
 */

export type Rotation = 0 | 90 | 180 | 270;

export interface Size {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/** Normalised to the rotated image: 0..1 on both axes */
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const FULL_CROP: CropRect = { x: 0, y: 0, w: 1, h: 1 };

export const MIN_CROP = 0.1;

export interface CanvasLayout {
  /** Display pixels per image pixel */
  scale: number;
  canvasWidth: number;
  canvasHeight: number;
  rotatedLeft: number;
  rotatedTop: number;
  rotatedWidth: number;
  rotatedHeight: number;
  imageLeft: number;
  imageTop: number;
  imageWidth: number;
  imageHeight: number;
}

export const rotatedSize = (image: Size, rotation: Rotation): Size =>
  rotation % 180 === 0 ? image : { width: image.height, height: image.width };

export const computeLayout = (
  image: Size,
  rotation: Rotation,
  crop: CropRect,
  area: Size
): CanvasLayout => {
  const rotated = rotatedSize(image, rotation);
  const cropWidth = crop.w * rotated.width;
  const cropHeight = crop.h * rotated.height;
  const scale = Math.min(area.width / cropWidth, area.height / cropHeight);

  const rotatedWidth = rotated.width * scale;
  const rotatedHeight = rotated.height * scale;
  const imageWidth = image.width * scale;
  const imageHeight = image.height * scale;

  return {
    scale,
    canvasWidth: cropWidth * scale,
    canvasHeight: cropHeight * scale,
    rotatedLeft: -crop.x * rotatedWidth,
    rotatedTop: -crop.y * rotatedHeight,
    rotatedWidth,
    rotatedHeight,
    imageLeft: (rotatedWidth - imageWidth) / 2,
    imageTop: (rotatedHeight - imageHeight) / 2,
    imageWidth,
    imageHeight,
  };
};

// Undo the clockwise display rotation of a vector
const unrotate = ({ x, y }: Point, rotation: Rotation): Point => {
  const angle = (rotation * Math.PI) / 180;
  const cos = Math.round(Math.cos(angle));
  const sin = Math.round(Math.sin(angle));
  return { x: x * cos + y * sin, y: -x * sin + y * cos };
};

/** A point on the canvas → normalised coordinates on the unrotated image */
export const canvasToImage = (
  point: Point,
  layout: CanvasLayout,
  rotation: Rotation
): Point => {
  const fromCentre = unrotate(
    {
      x: point.x - layout.rotatedLeft - layout.rotatedWidth / 2,
      y: point.y - layout.rotatedTop - layout.rotatedHeight / 2,
    },
    rotation
  );
  return {
    x: (fromCentre.x + layout.imageWidth / 2) / layout.imageWidth,
    y: (fromCentre.y + layout.imageHeight / 2) / layout.imageHeight,
  };
};

/** A finger movement on screen → movement in normalised image coordinates */
export const canvasDeltaToImage = (
  delta: Point,
  layout: CanvasLayout,
  rotation: Rotation
): Point => {
  const d = unrotate(delta, rotation);
  return { x: d.x / layout.imageWidth, y: d.y / layout.imageHeight };
};

/** Keep the same region selected when the image turns 90° clockwise */
export const rotateCropClockwise = (crop: CropRect): CropRect => ({
  x: 1 - crop.y - crop.h,
  y: crop.x,
  w: crop.h,
  h: crop.w,
});

export const nextRotation = (rotation: Rotation): Rotation =>
  ((rotation + 90) % 360) as Rotation;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type CropHandle = 'move' | 'tl' | 'tr' | 'bl' | 'br';

/** Drag a corner (or the whole frame) by a normalised delta */
export const dragCrop = (
  start: CropRect,
  handle: CropHandle,
  dx: number,
  dy: number
): CropRect => {
  if (handle === 'move') {
    return {
      ...start,
      x: clamp(start.x + dx, 0, 1 - start.w),
      y: clamp(start.y + dy, 0, 1 - start.h),
    };
  }

  let left = start.x;
  let top = start.y;
  let right = start.x + start.w;
  let bottom = start.y + start.h;

  if (handle === 'tl' || handle === 'bl') {
    left = clamp(left + dx, 0, right - MIN_CROP);
  } else {
    right = clamp(right + dx, left + MIN_CROP, 1);
  }
  if (handle === 'tl' || handle === 'tr') {
    top = clamp(top + dy, 0, bottom - MIN_CROP);
  } else {
    bottom = clamp(bottom + dy, top + MIN_CROP, 1);
  }
  return { x: left, y: top, w: right - left, h: bottom - top };
};

export const isFullCrop = (crop: CropRect) =>
  crop.x === 0 && crop.y === 0 && crop.w === 1 && crop.h === 1;
