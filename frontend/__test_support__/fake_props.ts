import { AddPlantProps } from "../three_d_garden/bed";
import { fakeDesignerState } from "./fake_designer_state";

export const fakeAddPlantProps =
  (): AddPlantProps => ({
    gridSize: { x: 1000, y: 2000 },
    botPosition: { x: 0, y: 0, z: 0 },
    dispatch: jest.fn(),
    getConfigValue: jest.fn(() => true),
    curves: [],
    designer: fakeDesignerState(),
    topDownAtStart: false,
  });
