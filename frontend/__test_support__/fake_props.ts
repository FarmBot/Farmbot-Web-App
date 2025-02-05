import { TaggedPlant } from "../farm_designer/map/interfaces";
import { AddPlantProps } from "../three_d_garden/bed";
import { fakeDesignerState } from "./fake_designer_state";

export const fakeAddPlantProps =
  (plants: TaggedPlant[]): AddPlantProps => ({
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
    getConfigValue: jest.fn(() => true),
    plants,
    curves: [],
    designer: fakeDesignerState(),
  });
