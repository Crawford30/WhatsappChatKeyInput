import {
  CropRect,
  FULL_CROP,
  isFullCrop,
  Point,
  Rotation,
  Size,
} from '../../Helpers/imageEditGeometry';

/** Freehand line; points are normalised to the unrotated image */
export interface Stroke {
  id: number;
  points: Point[];
  color: string;
  /** Line width as a fraction of the image width */
  width: number;
}

/** Text or emoji placed on the image; `size` is a fraction of image width */
export interface Overlay {
  id: number;
  kind: 'text' | 'emoji';
  value: string;
  color: string;
  x: number;
  y: number;
  size: number;
}

export interface ImageEdit {
  size: Size;
  rotation: Rotation;
  crop: CropRect;
  strokes: Stroke[];
  overlays: Overlay[];
  caption: string;
}

export const EDITOR_COLORS = [
  '#FFFFFF',
  '#000000',
  '#FF3B30',
  '#FF9500',
  '#FFCC00',
  '#34C759',
  '#1b75bb',
  '#AF52DE',
];

export const newEdit = (size: Size, caption = ''): ImageEdit => ({
  size,
  rotation: 0,
  crop: FULL_CROP,
  strokes: [],
  overlays: [],
  caption,
});

/** Anything that changes pixels (a caption alone doesn't) */
export const hasPixelEdits = (edit: ImageEdit) =>
  edit.rotation !== 0 ||
  !isFullCrop(edit.crop) ||
  edit.strokes.length > 0 ||
  edit.overlays.length > 0;
