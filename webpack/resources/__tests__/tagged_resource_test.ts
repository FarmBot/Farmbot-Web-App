import { fakeTool } from "../../__test_support__/fake_state/resources";
import { getArrayStatus, sanityCheck } from "../tagged_resources";
import { SpecialStatus } from "farmbot";

describe("getArrayStatus()", () => {
  const toolArray = () => [fakeTool(), fakeTool(), fakeTool()];
  it("picks SAVING above all else", () => {
    const arr = toolArray();
    arr[0].specialStatus = SpecialStatus.SAVED;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = SpecialStatus.SAVING;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.SAVING);
  });

  it("picks DIRTY over undefined", () => {
    const arr = toolArray();
    arr[0].specialStatus = SpecialStatus.SAVED;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = SpecialStatus.SAVED;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.DIRTY);
  });

  it("picks undefined as a last resort", () => {
    const arr = toolArray();
    arr[0].specialStatus = SpecialStatus.SAVED;
    arr[1].specialStatus = SpecialStatus.SAVED;
    arr[2].specialStatus = SpecialStatus.SAVED;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.SAVED);
  });
});

describe("sanityCheck", () => {
  it("crashes on malformed TaggedResources", () => {
    expect(() => sanityCheck({})).toThrow("Bad kind, uuid, or body: {}");
  });
});
