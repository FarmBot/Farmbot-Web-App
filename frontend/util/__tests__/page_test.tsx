jest.mock("../stop_ie", () => ({ stopIE: jest.fn() }));

jest.mock("../../i18n", () => ({
  detectLanguage: jest.fn(() => Promise.resolve({})),
}));

import { updatePageInfo, attachToRoot, entryPoint } from "../page";
import React from "react";
import { detectLanguage } from "../../i18n";
import { stopIE } from "../stop_ie";
import { init } from "i18next";

describe("updatePageInfo()", () => {
  it("sets page title", () => {
    updatePageInfo("page name");
    expect(document.title).toEqual("Page name - FarmBot");
  });

  it("sets page title: Farm Designer", () => {
    updatePageInfo("designer");
    expect(document.title).toEqual("Farm designer - FarmBot");
  });

  it("sets page title: Farm Designer: Plants", () => {
    updatePageInfo("designer", "plants");
    expect(document.title).toEqual("Farm designer: Plants - FarmBot");
  });
});

class Foo extends React.Component<{ text: string }> {
  render() { return <p>{this.props.text}</p>; }
}

const clear = () => {
  const root = document.getElementById("root");
  root && document.body.removeChild(root);
};

describe("attachToRoot()", () => {
  it("attaches page", () => {
    clear();
    attachToRoot(Foo, { text: "Bar" });
    expect(document.body.innerHTML).toEqual("<div id=\"root\"><p>Bar</p></div>");
    expect(document.body.textContent).toEqual("Bar");
  });
});

describe("entryPoint()", () => {
  it("calls entry callbacks", async () => {
    clear();
    await entryPoint(Foo);
    expect(document.body.innerHTML).toEqual("<div id=\"root\"><p></p></div>");
    expect(detectLanguage).toHaveBeenCalled();
    expect(init).toHaveBeenCalled();
    expect(stopIE).toHaveBeenCalled();
  });
});
