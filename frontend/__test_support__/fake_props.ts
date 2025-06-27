import { AddPlantProps } from "../three_d_garden/bed";
import { fakeDesignerState } from "./fake_designer_state";

export const fakeAddPlantProps =
  (): AddPlantProps => ({
    gridSize: { x: 1000, y: 2000 },
    dispatch: jest.fn(),
    getConfigValue: jest.fn(() => true),
    curves: [],
    designer: fakeDesignerState(),
  });
