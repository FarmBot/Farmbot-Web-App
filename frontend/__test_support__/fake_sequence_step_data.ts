import {
  HardwareFlags, FarmwareData, StepParams,
} from "../sequences/interfaces";
import { SequenceBodyItem } from "farmbot";
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

export const fakeStepParams =
  <T extends SequenceBodyItem>(step: T): StepParams<T> => {
    return {
      currentSequence: fakeSequence(),
      currentStep: step,
      dispatch: jest.fn(),
      readOnly: false,
      index: 0,
      resources: emptyState().index,
      sequencesState: emptyState().consumers.sequences,
    };
  };
