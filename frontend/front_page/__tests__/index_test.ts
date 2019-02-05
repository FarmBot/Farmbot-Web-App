jest.mock("../../i18n", () => {
  return { detectLanguage: jest.fn(() => Promise.resolve()) };
});

jest.mock("../../util/stop_ie", () => {
  return { stopIE: jest.fn() };
});

jest.mock("../../util",
  () => ({ attachToRoot: jest.fn(), trim: (s: string) => s }));

import { detectLanguage } from "../../i18n";
import { stopIE } from "../../util/stop_ie";
import { attachToRoot } from "../../util";
import { FrontPage, attachFrontPage } from "../front_page";

describe("index", () => {
  it("Attaches to the DOM", async () => {
    await import("../index");
    expect(detectLanguage).toHaveBeenCalled();
    expect(stopIE).toHaveBeenCalled();
  });

  it("attaches FrontPage to DOM specifically", () => {
    attachFrontPage();
    expect(attachToRoot).toHaveBeenCalledWith(FrontPage, {});
  });
});
