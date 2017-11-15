jest.mock("../../toast_errors", () => {
  return { toastErrors: jest.fn() };
});

import { updateOK, generalizedError } from "../actions";
import { fakeUser } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";
import { toastErrors } from "../../toast_errors";

describe("updateOK()", () => {
  it("creates an action", () => {
    const result = updateOK(fakeUser());
    expect(result).toBeDefined();
    expect(result.type).toEqual(Actions.UPDATE_RESOURCE_OK);
  });
});

describe("generalizedError()", () => {
  it("creates an action", () => {
    const payl = { err: {}, uuid: "---" };
    const result = generalizedError(payl);
    expect(result).toBeDefined();
    expect(result.type).toEqual(Actions._RESOURCE_NO);
    expect(toastErrors).toHaveBeenCalledWith(payl);
  });
});
