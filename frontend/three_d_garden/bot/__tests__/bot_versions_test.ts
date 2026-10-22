import { kitVersionFromFirmware } from "../bot_versions";

describe("kitVersionFromFirmware()", () => {
  it.each([
    ["arduino", "v1.2"],
    ["farmduino", "v1.3"],
    ["farmduino_k14", "v1.7"],
    ["farmduino_k17", "v1.7"],
    ["farmduino_k18", "v1.8"],
    ["farmduino_k19", "v1.9"],
    [undefined, "v1.7"],
  ])("maps %s to %s", (hardware, version) => {
    expect(kitVersionFromFirmware(hardware)).toEqual(version);
  });
});
