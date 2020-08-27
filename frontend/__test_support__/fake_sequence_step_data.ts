import {
  HardwareFlags, FarmwareData, StepParams,
} from "../sequences/interfaces";
import { WritePin } from "farmbot";
import { fakeSequence } from "./fake_state/resources";
import { emptyState } from "../resources/reducer";

export const fakeHardwareFlags = (): HardwareFlags => ({
  findHomeEnabled: { x: false, y: false, z: false },
  stopAtHome: { x: false, y: false, z: false },
  stopAtMax: { x: false, y: false, z: false },
  negativeOnly: { x: false, y: false, z: false },
  axisLength: { x: 0, y: 0, z: 0 },
});

export const fakeFarmwareData = (): FarmwareData => ({
  farmwareNames: [],
  firstPartyFarmwareNames: [],
  showFirstPartyFarmware: false,
  farmwareConfigs: {},
  cameraDisabled: false,
  cameraCalibrated: true,
});

export const fakeStepParams = (): StepParams => {
  const step: WritePin = {
    kind: "write_pin",
    args: { pin_number: 3, pin_value: 2, pin_mode: 1 }
  };
  return {
    currentSequence: fakeSequence(),
    currentStep: step,
    dispatch: jest.fn(),
    index: 0,
    resources: emptyState().index,
  };
};
