jest.mock("../../util/stop_ie", () => ({
  stopIE: jest.fn()
}));

jest.mock("../../util", () => ({
  attachToRoot: jest.fn()
}));

jest.mock("../../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve({}))
}));

import { stopIE } from "../../util/stop_ie";
import { attachToRoot } from "../../util";
import { detectLanguage } from "../../i18n";
import { DemoIframe } from "../demo_iframe";
import I from "i18next";

describe("DemoIframe loader", () => {
  it("calls expected callbacks", async () => {
    await import("../index");
    expect(stopIE).toHaveBeenCalled();
    expect(detectLanguage).toHaveBeenCalled();
    expect(I.init).toHaveBeenCalled();
    expect(attachToRoot).toHaveBeenCalledWith(DemoIframe);
  });
});
