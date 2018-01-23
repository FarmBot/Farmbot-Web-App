jest.mock("../../revert_to_english", () => {
  return { revertToEnglish: jest.fn() };
});

import { revertToEnglishMiddleware } from "../revert_to_english_middleware";
import { revertToEnglish } from "../../revert_to_english";
import { Actions } from "../../constants";

describe("revertToEnglishMiddleware", () => {
  it("calls `revertToEnglish` when appropriate", () => {
    const dispatch = jest.fn(() => ({}));
    const action = {
      type: Actions.RESOURCE_READY,
      payload: { name: "WebAppConfig", data: { disable_i18n: true } }
    };
    expect(revertToEnglish).not.toHaveBeenCalled();
    revertToEnglishMiddleware.fn({} as any)(dispatch)(action);
    expect(revertToEnglish).toHaveBeenCalled();
    expect(revertToEnglishMiddleware.env).toBe("*");
  });
});
