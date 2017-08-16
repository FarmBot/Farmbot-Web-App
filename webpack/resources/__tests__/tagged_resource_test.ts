import { fakeTool } from "../../__test_support__/fake_state/resources";
import { SpecialStatus, getArrayStatus } from "../tagged_resources";

describe("getArrayStatus()", () => {
  let toolArray = () => [fakeTool(), fakeTool(), fakeTool()];
  it("picks SAVING above all else", () => {
    let arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = SpecialStatus.SAVING;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.SAVING);
  });

  it("picks DIRTY over undefined", () => {
    let arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = undefined;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.DIRTY);
  });

  it("picks undefined as a last resort", () => {
    let arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = undefined;
    arr[2].specialStatus = undefined;
    expect(getArrayStatus(arr)).toBe(undefined);
  });
});
