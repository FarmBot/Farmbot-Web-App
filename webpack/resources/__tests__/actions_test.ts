jest.mock("../../toast_errors", () => {
  return { toastErrors: jest.fn() };
});

import { updateOK, generalizedError, GeneralizedError } from "../actions";
import { fakeUser } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { toastErrors } from "../../toast_errors";
import { SpecialStatus } from "farmbot";

describe("updateOK()", () => {
  it("creates an action", () => {
    const result = updateOK(fakeUser());
    expect(result).toBeDefined();
    expect(result.type).toEqual(Actions.UPDATE_RESOURCE_OK);
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
    expect(toastErrors).toHaveBeenCalledWith(payl);
  });
});
