import { revertToEnglishMiddleware } from "../revert_to_english_middleware";
import * as revertToEnglishModule from "../../revert_to_english";
import { resourceReady, newTaggedResource } from "../../sync/actions";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { arrayUnwrap } from "../../resources/util";
import { Store } from "redux";
import { Everything } from "../../interfaces";

describe("revertToEnglishMiddleware", () => {
  let revertToEnglishSpy: jest.SpyInstance;

  beforeEach(() => {
    revertToEnglishSpy = jest.spyOn(revertToEnglishModule, "revertToEnglish")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    revertToEnglishSpy.mockRestore();
  });

  it("calls `revertToEnglish` when appropriate", () => {
    const dispatch = jest.fn(() => ({}));
    const data = { disable_i18n: true } as WebAppConfig;
    const tr = arrayUnwrap(newTaggedResource("WebAppConfig", data));
    const action = resourceReady("WebAppConfig", tr);
    expect(revertToEnglishSpy).not.toHaveBeenCalled();
    revertToEnglishMiddleware.fn({} as Store<Everything>)(dispatch)(action);
    expect(revertToEnglishSpy).toHaveBeenCalled();
    expect(revertToEnglishMiddleware.env).toBe("*");
  });
});
