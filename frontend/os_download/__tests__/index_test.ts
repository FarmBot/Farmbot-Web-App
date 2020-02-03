jest.mock("i18next", () => ({ init: jest.fn((_, ok) => ok()) }));
jest.mock("react-dom", () => ({ render: jest.fn() }));
jest.mock("../../i18n",
  () => ({ detectLanguage: jest.fn(() => Promise.resolve()) }));

import { detectLanguage } from "../../i18n";
import { render } from "react-dom";

describe("index.ts", () => {
  it("attaches the os download page to the DOM", async () => {
    await import("../index");
    expect(detectLanguage).toHaveBeenCalled();
    expect(document.getElementById("root")).toBeTruthy();
    expect(render).toHaveBeenCalled();
  });
});
