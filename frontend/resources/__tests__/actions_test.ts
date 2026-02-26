import {
  generalizedError,
  GeneralizedError,
  saveOK,
} from "../actions";
import { fakeUser } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import * as toastErrorsModule from "../../toast_errors";
import { SpecialStatus } from "farmbot";

let toastErrorsSpy: jest.SpyInstance;

beforeEach(() => {
  toastErrorsSpy = jest.spyOn(toastErrorsModule, "toastErrors")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  toastErrorsSpy.mockRestore();
});
describe("updateOK()", () => {
  it("creates an action", () => {
    const result = saveOK(fakeUser());
    expect(result).toBeDefined();
    expect(result.type).toEqual(Actions.SAVE_RESOURCE_OK);
  });
});

describe("generalizedError()", () => {
  it("creates an action", () => {
    const payl: GeneralizedError = {
      err: {},
      uuid: "---",
      statusBeforeError: SpecialStatus.DIRTY
    };
    const result = generalizedError(payl);
    expect(result).toBeDefined();
    expect(result.type).toEqual(Actions._RESOURCE_NO);
    expect(toastErrorsSpy).toHaveBeenCalledWith(payl);
  });

  it("handles bad statuses", () => {
    const payl: GeneralizedError = {
      err: {},
      uuid: "---",
      statusBeforeError: SpecialStatus.SAVING
    };
    const result = generalizedError(payl);
    expect(result.payload.statusBeforeError).toEqual(SpecialStatus.DIRTY);
  });
});
