import { HardwareFlags, FarmwareData } from "../sequences/interfaces";

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
});
