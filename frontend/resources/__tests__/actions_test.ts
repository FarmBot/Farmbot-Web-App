import {
  generalizedError,
  GeneralizedError,
  sanitizeError,
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
    expect(payl.statusBeforeError).toEqual(SpecialStatus.SAVING);
  });
});

describe("sanitizeError()", () => {
  it("removes mutable event references", () => {
    const event = { currentTarget: { value: "123" } };
    const err = {
      message: "nope",
      event,
      response: {
        data: { error: "bad" },
        status: 422,
        statusText: "Unprocessable Entity",
        request: { mutable: true },
      },
    };
    const result = sanitizeError(err);
    expect(result).toEqual({
      message: "nope",
      response: {
        data: { error: "bad" },
        status: 422,
        statusText: "Unprocessable Entity",
      },
    });
    expect(result.event).toBeUndefined();
  });
});
