jest.mock("../../util/stop_ie", () => ({
  stopIE: jest.fn()
}));

jest.mock("../../util", () => ({
  shortRevision: jest.fn(),
  attachToRoot: jest.fn()
}));

jest.mock("../../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve({}))
}));

jest.mock("i18next", () => ({
  default: {
    init: jest.fn((_: {}, fn: Function) => fn())
  }
}));

import { stopIE } from "../../util/stop_ie";
import { shortRevision, attachToRoot } from "../../util";
import { detectLanguage } from "../../i18n";
import { DemoIframe } from "../demo_iframe";
import I from "i18next";

describe("DemoIframe loader", () => {
  it("calls  expected callbacks", (done) => {
    import("../index").then(() => {
      expect(stopIE).toHaveBeenCalled();
      expect(shortRevision).toHaveBeenCalled();
      expect(detectLanguage).toHaveBeenCalled();
      expect(I.init).toHaveBeenCalled();
      expect(attachToRoot).toHaveBeenCalledWith(DemoIframe);
      done();
    });
  });
});
