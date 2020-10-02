jest.mock("../../util/stop_ie", () => ({
  stopIE: jest.fn()
}));

jest.mock("../../util", () => ({
  attachToRoot: jest.fn()
}));

jest.mock("../../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve({}))
}));

import { attachToRoot } from "../../util";
import { detectLanguage } from "../../i18n";
import { stopIE } from "../../util/stop_ie";
import { TryFarmbot } from "../try_farmbot";
import I from "i18next";

describe("TryFarmbot loader", () => {
  it("fires callbacks", async () => {
    await import("../index");
    expect(attachToRoot).toHaveBeenCalledWith(TryFarmbot);
    expect(detectLanguage).toHaveBeenCalled();
    expect(I.init).toHaveBeenCalled();
    expect(stopIE).toHaveBeenCalled();
  });
});
