import {
  canvasDeltaToImage,
  canvasToImage,
  computeLayout,
  dragCrop,
  FULL_CROP,
  MIN_CROP,
  Rotation,
  rotateCropClockwise,
} from '../src/Helpers/imageEditGeometry';

const image = { width: 400, height: 200 };
const area = { width: 200, height: 400 };

describe('computeLayout', () => {
  test('fits the uncropped image into the area', () => {
    const layout = computeLayout(image, 0, FULL_CROP, area);
    expect(layout.scale).toBe(0.5);
    expect([layout.canvasWidth, layout.canvasHeight]).toEqual([200, 100]);
  });

  test('a 90° turn swaps the canvas aspect', () => {
    const layout = computeLayout(image, 90, FULL_CROP, area);
    expect([layout.canvasWidth, layout.canvasHeight]).toEqual([200, 400]);
  });

  test('cropping zooms the crop to fill the area', () => {
    const layout = computeLayout(
      image,
      0,
      { x: 0.5, y: 0, w: 0.5, h: 1 },
      area
    );
    expect(layout.scale).toBe(1);
    expect(layout.rotatedLeft).toBe(-200);
  });
});

describe('canvasToImage', () => {
  const corners = (rotation: Rotation) => {
    const layout = computeLayout(image, rotation, FULL_CROP, area);
    const round = ({ x, y }: { x: number; y: number }) => ({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
    });
    return round(canvasToImage({ x: 0, y: 0 }, layout, rotation));
  };

  // Which corner of the original image ends up top-left on screen
  test.each([
    [0, { x: 0, y: 0 }],
    [90, { x: 0, y: 1 }],
    [180, { x: 1, y: 1 }],
    [270, { x: 1, y: 0 }],
  ] as const)('rotation %d', (rotation, expected) => {
    expect(corners(rotation)).toEqual(expected);
  });

  test('accounts for the crop offset', () => {
    const layout = computeLayout(
      image,
      0,
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      area
    );
    expect(canvasToImage({ x: 0, y: 0 }, layout, 0)).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });

  test('deltas follow the rotation', () => {
    const layout = computeLayout(image, 90, FULL_CROP, area);
    // Moving right on screen moves "up" the original image when turned 90°
    const delta = canvasDeltaToImage({ x: 10, y: 0 }, layout, 90);
    expect(delta.x).toBeCloseTo(0);
    expect(delta.y).toBeLessThan(0);
  });
});

describe('crop editing', () => {
  test('rotating keeps the same region selected', () => {
    const crop = { x: 0.1, y: 0.2, w: 0.3, h: 0.4 };
    let rotated = crop;
    for (let i = 0; i < 4; i++) rotated = rotateCropClockwise(rotated);
    expect(rotated.x).toBeCloseTo(crop.x);
    expect(rotated.y).toBeCloseTo(crop.y);
    expect(rotateCropClockwise(crop)).toEqual({
      x: 0.4,
      y: 0.1,
      w: 0.4,
      h: 0.3,
    });
  });

  test('corners clamp to the image and a minimum size', () => {
    expect(dragCrop(FULL_CROP, 'tl', -0.5, -0.5)).toEqual(FULL_CROP);
    const shrunk = dragCrop(FULL_CROP, 'br', -2, -2);
    expect(shrunk.w).toBeCloseTo(MIN_CROP);
    expect(shrunk.h).toBeCloseTo(MIN_CROP);
  });

  test('moving keeps the frame inside the image', () => {
    const crop = { x: 0.2, y: 0.2, w: 0.5, h: 0.5 };
    expect(dragCrop(crop, 'move', 1, 1)).toEqual({ ...crop, x: 0.5, y: 0.5 });
  });
});
