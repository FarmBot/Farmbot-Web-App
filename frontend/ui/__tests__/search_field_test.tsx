import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { SearchField, SearchFieldProps } from "../search_field";
import { keyboardEvent } from "../../__test_support__/fake_html_events";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../__test_support__/test_renderer";

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
    const wrapper = createRenderer(<SearchField {...p} />);
    const e = keyboardEvent("new");
    e.currentTarget.value = "new";
    actRenderer(() => {
      wrapper.root.findByType("input").props.onKeyPress(e);
    });
    expect(p.onKeyPress).toHaveBeenCalledWith("new");
    unmountRenderer(wrapper);
  });

  it("doesn't change search term on key press", () => {
    const p = fakeProps();
    p.onKeyPress = undefined;
    const wrapper = createRenderer(<SearchField {...p} />);
    const e = keyboardEvent("new");
    actRenderer(() => {
      wrapper.root.findByType("input").props.onKeyPress(e);
    });
    expect(p.onChange).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
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
    const wrapper = createRenderer(<SearchField {...p} />);
    const e = keyboardEvent("Enter");
    actRenderer(() => {
      wrapper.root.findByType("input").props.onKeyPress(e);
    });
    expect(p.onEnter).toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("doesn't call callback upon enter key press", () => {
    const p = fakeProps();
    p.onEnter = undefined;
    const wrapper = createRenderer(<SearchField {...p} />);
    const e = keyboardEvent("Enter");
    actRenderer(() => {
      wrapper.root.findByType("input").props.onKeyPress(e);
    });
    unmountRenderer(wrapper);
  });
});
