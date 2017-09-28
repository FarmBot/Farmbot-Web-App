const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      getBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      },
      invertBool: (k: string) => {
        console.log(`${k} will go from ${mockStorj[k]} to ${!mockStorj[k]}`);
        mockStorj[k] = !mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import { fetchLabFeatures, maybeToggleFeature, LabsFeature } from "../labs_features_list_data";
import { BooleanSetting } from "../../../session_keys";

describe("maybeToggleFeature()", () => {
  it("returns `undefined` without consent", () => {
    Object.defineProperty(global, "confirm", () => false);
    const data: LabsFeature = {
      name: "Example",
      value: false,
      description: "I stub this.",
      storageKey: BooleanSetting.weedDetector
    };
    const out = maybeToggleFeature(data);
    expect(data.value).toBeFalsy();
    expect(out).toBeUndefined();
  });

  it("updates a `LabsFeature` with consent", () => {
    // tslint:disable-next-line:no-any
    (global as any).confirm = () => true;
    const data: LabsFeature = {
      name: "Example1",
      value: (mockStorj[BooleanSetting.weedDetector] = false),
      description: "I stub this.",
      storageKey: BooleanSetting.weedDetector
    };
    const out = maybeToggleFeature(data);
    out ?
      expect(out.value).toBeTruthy() : fail("out === undefined. Thats bad");
    expect(out).toBeTruthy();
  });

  it("Does not require consent when going from true to false", () => {
    const conf = jest.fn(() => true);
    Object.defineProperty(global, "confirm", conf);
    const output = maybeToggleFeature({
      name: "Example",
      value: (mockStorj[BooleanSetting.weedDetector] = true),
      description: "I stub this.",
      storageKey: BooleanSetting.weedDetector
    });
    expect(conf).not.toHaveBeenCalled();
    output ?
      expect(output.value).toBeFalsy() : fail("`output` should be defined.");
  });
});

describe("fetchLabFeatures", () => {
  it("basically just initializes stuff", () => {
    const val = fetchLabFeatures();
    expect(val.length).toBe(1);
    expect(val[0].value).toBeFalsy();
  });
});
