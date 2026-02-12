import React from "react";
import { fireEvent, render } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import { SearchField, SearchFieldProps } from "../search_field";
import { keyboardEvent } from "../../__test_support__/fake_html_events";

describe("<SearchField />", () => {
  const fakeProps = (): SearchFieldProps => ({
    nameKey: "test",
    onChange: jest.fn(),
    searchTerm: "",
    placeholder: "search...",
  });

  it("renders", () => {
    const { container } = render(<SearchField {...fakeProps()} />);
    expect((container.querySelector("input") as HTMLInputElement).placeholder)
      .toEqual("search...");
  });

  it("changes search term", () => {
    const p = fakeProps();
    const { container } = render(<SearchField {...p} />);
    fireEvent.change(container.querySelector("input") as Element, {
      currentTarget: { value: "new" },
      target: { value: "new" },
    });
    expect(p.onChange).toHaveBeenCalledWith("new");
  });

  it("changes search term on key press", () => {
    const p = fakeProps();
    p.onKeyPress = jest.fn();
    const wrapper = TestRenderer.create(<SearchField {...p} />);
    const e = keyboardEvent("new");
    e.currentTarget.value = "new";
    wrapper.root.findByType("input").props.onKeyPress(e);
    expect(p.onKeyPress).toHaveBeenCalledWith("new");
    wrapper.unmount();
  });

  it("doesn't change search term on key press", () => {
    const p = fakeProps();
    p.onKeyPress = undefined;
    const wrapper = TestRenderer.create(<SearchField {...p} />);
    const e = keyboardEvent("new");
    wrapper.root.findByType("input").props.onKeyPress(e);
    expect(p.onChange).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("clears search term", () => {
    const p = fakeProps();
    p.searchTerm = "old";
    const { container } = render(<SearchField {...p} />);
    fireEvent.click(container.querySelector(".fa-times") as Element);
    expect(p.onChange).toHaveBeenCalledWith("");
  });

  it("calls callback upon enter key press", () => {
    const p = fakeProps();
    p.onEnter = jest.fn();
    const wrapper = TestRenderer.create(<SearchField {...p} />);
    const e = keyboardEvent("Enter");
    wrapper.root.findByType("input").props.onKeyPress(e);
    expect(p.onEnter).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("doesn't call callback upon enter key press", () => {
    const p = fakeProps();
    p.onEnter = undefined;
    const wrapper = TestRenderer.create(<SearchField {...p} />);
    const e = keyboardEvent("Enter");
    wrapper.root.findByType("input").props.onKeyPress(e);
    wrapper.unmount();
  });
});
