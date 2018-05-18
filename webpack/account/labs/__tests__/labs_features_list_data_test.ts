const mockStorj: Dictionary<boolean> = {};

jest.mock("../../../session", () => {
  return {
    Session: {
      deprecatedGetBool: (k: string) => {
        mockStorj[k] = !!mockStorj[k];
        return mockStorj[k];
      },
      invertBool: (k: string) => {
        mockStorj[k] = !mockStorj[k];
        return mockStorj[k];
      }
    }
  };
});

import { Dictionary } from "farmbot";
import { maybeToggleFeature, LabsFeature } from "../labs_features_list_data";
import { BooleanSetting } from "../../../session_keys";

describe("maybeToggleFeature()", () => {
  it("returns `undefined` without consent", () => {
    window.confirm = jest.fn(() => false);
    const data: LabsFeature = {
      name: "Example",
      value: false,
      description: "I stub this.",
      storageKey: BooleanSetting.stub_config,
      confirmationMessage: "are you sure?"
    };
    const out = maybeToggleFeature(data);
    expect(data.value).toBeFalsy();
    expect(out).toBeUndefined();
    expect(window.confirm).toHaveBeenCalledWith(data.confirmationMessage);
  });

  it("updates a `LabsFeature` with consent", () => {
    window.confirm = () => true;
    const data: LabsFeature = {
      name: "Example1",
      value: (mockStorj[BooleanSetting.stub_config] = false),
      description: "I stub this.",
      storageKey: BooleanSetting.stub_config,
      confirmationMessage: "are you sure?"
    };
    const out = maybeToggleFeature(data);
    out ?
      expect(out.value).toBeTruthy() : fail("out === undefined. Thats bad");
    expect(out).toBeTruthy();
  });

  it("Does not require consent when going from true to false", () => {
    window.confirm = jest.fn(() => true);
    const output = maybeToggleFeature({
      name: "Example",
      value: (mockStorj[BooleanSetting.stub_config] = true),
      description: "I stub this.",
      storageKey: BooleanSetting.stub_config,
      confirmationMessage: "are you sure?"
    });
    expect(window.confirm).not.toHaveBeenCalled();
    output ?
      expect(output.value).toBeFalsy() : fail("`output` should be defined.");
  });

  it("updates a `LabsFeature` when consent is not required", () => {
    const data: LabsFeature = {
      name: "Example1",
      value: (mockStorj[BooleanSetting.stub_config] = false),
      description: "I stub this.",
      storageKey: BooleanSetting.stub_config
    };
    const out = maybeToggleFeature(data);
    out ?
      expect(out.value).toBeTruthy() : fail("out === undefined. Thats bad");
    expect(out).toBeTruthy();
  });
});
