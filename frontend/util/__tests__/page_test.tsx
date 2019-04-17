import { updatePageInfo, attachToRoot } from "../page";
import React from "react";

describe("updatePageInfo()", () => {
  it("sets page title", () => {
    updatePageInfo("page name");
    expect(document.title).toEqual("Page name - FarmBot");
  });

  it("sets page title: Farm Designer", () => {
    updatePageInfo("designer");
    expect(document.title).toEqual("Farm designer - FarmBot");
  });
});

describe("attachToRoot()", () => {
  class Foo extends React.Component<{ text: string }> {
    render() { return <p>{this.props.text}</p>; }
  }
  it("attaches page", () => {
    attachToRoot(Foo, { text: "Bar" });
    expect(document.body.innerHTML).toEqual(`<div id="root"><p>Bar</p></div>`);
    expect(document.body.textContent).toEqual("Bar");
  });
});
