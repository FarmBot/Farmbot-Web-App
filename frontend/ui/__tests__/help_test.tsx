import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Help, HelpProps } from "../help";
import * as popover from "../popover";

let popoverSpy: jest.SpyInstance;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover").mockImplementation(
    jest.fn(({ target, content }: {
      target: React.ReactElement;
      content: React.ReactElement;
    }) => <div>{target}{content}</div>) as never);
});

afterEach(() => {
  popoverSpy.mockRestore();
});

describe("<Help />", () => {
  const fakeProps = (): HelpProps => ({
    text: "tip",
  });

  it("returns help", () => {
    const { container } = render(<Help {...fakeProps()} />);
    expect(container.textContent).toContain("tip");
  });

  it("returns help markdown", () => {
    const p = fakeProps();
    p.enableMarkdown = true;
    p.text = "# title";
    const { container } = render(<Help {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("title");
  });

  it("forwards portal configuration", () => {
    render(<Help {...fakeProps()} usePortal={false} />);
    expect(popoverSpy).toHaveBeenCalledWith(
      expect.objectContaining({ usePortal: false }),
      undefined,
    );
  });

  it("supports a keyboard-accessible trigger", () => {
    const setOpen = jest.fn();
    const { getByRole } = render(<Help {...fakeProps()}
      focusable={true}
      setOpen={setOpen} />);
    const trigger = getByRole("button");
    expect(trigger).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(setOpen).toHaveBeenCalled();
  });
});
