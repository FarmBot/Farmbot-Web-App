import { fakeTool } from "../../__test_support__/fake_state/resources";
import { SpecialStatus, getArrayStatus } from "../tagged_resources";

describe("getArrayStatus()", () => {
  const toolArray = () => [fakeTool(), fakeTool(), fakeTool()];
  it("picks SAVING above all else", () => {
    const arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = SpecialStatus.SAVING;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.SAVING);
  });

  it("picks DIRTY over undefined", () => {
    const arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = SpecialStatus.DIRTY;
    arr[2].specialStatus = undefined;
    expect(getArrayStatus(arr)).toBe(SpecialStatus.DIRTY);
  });

  it("picks undefined as a last resort", () => {
    const arr = toolArray();
    arr[0].specialStatus = undefined;
    arr[1].specialStatus = undefined;
    arr[2].specialStatus = undefined;
    expect(getArrayStatus(arr)).toBe(undefined);
  });
});
