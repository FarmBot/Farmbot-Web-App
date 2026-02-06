import React from "react";
import { mount } from "enzyme";
import { Help, HelpProps } from "../help";
import * as popover from "../popover";

let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover").mockImplementation(
    jest.fn(({ target, content }: { target: JSX.Element; content: JSX.Element }) =>
      <div>{target}{content}</div>) as never);
});

afterEach(() => {
  popoverSpy.mockRestore();
});

describe("<Help />", () => {
  const fakeProps = (): HelpProps => ({
    text: "tip",
  });

  it("returns help", () => {
    const wrapper = mount(<Help {...fakeProps()} />);
    expect(wrapper.text()).toContain("tip");
  });

  it("returns help markdown", () => {
    const p = fakeProps();
    p.enableMarkdown = true;
    p.text = "# title";
    const wrapper = mount(<Help {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("title");
  });
});
