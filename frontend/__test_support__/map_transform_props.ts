import { MapTransformProps } from "../farm_designer/map/interfaces";

export const fakeMapTransformProps = (): MapTransformProps => {
  return {
    quadrant: 2,
    gridSize: { x: 3000, y: 1500 },
    xySwap: false,
  };
};
