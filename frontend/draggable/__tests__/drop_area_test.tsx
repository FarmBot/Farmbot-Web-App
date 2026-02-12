import React from "react";
import { act, createEvent, fireEvent, render } from "@testing-library/react";
import { DropArea } from "../drop_area";
import { DropAreaProps } from "../interfaces";

describe("<DropArea />", () => {
  const fakeProps = (): DropAreaProps => ({
    callback: jest.fn(),
    isLocked: false,
    children: undefined,
  });

  it("opens", () => {
    const ref = React.createRef<DropArea>();
    const { container } = render(<DropArea {...fakeProps()} ref={ref} />);
    ref.current?.setState({ isHovered: true });
    expect(container.firstChild).toHaveClass("drag-drop-area");
  });

  it("is locked open", () => {
    const p = fakeProps();
    p.isLocked = true;
    const { container } = render(<DropArea {...p} />);
    expect(container.firstChild).toHaveClass("drag-drop-area");
  });

  it("renders children", () => {
    const { container } = render(<DropArea {...fakeProps()}>children</DropArea>);
    expect(container.textContent).toEqual("children");
  });

  it("handles drag enter", () => {
    const preventDefault = jest.fn();
    const ref = React.createRef<DropArea>();
    const { container } = render(<DropArea {...fakeProps()} ref={ref} />);
    expect(ref.current?.state.isHovered).toEqual(false);
    const event = createEvent.dragEnter(container.firstChild as Element);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    fireEvent(container.firstChild as Element, event);
    expect(preventDefault).toHaveBeenCalled();
    expect(ref.current?.state.isHovered).toEqual(true);
  });

  it("handles drag leave", () => {
    const ref = React.createRef<DropArea>();
    const { container } = render(<DropArea {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ isHovered: true }));
    fireEvent.dragLeave(container.firstChild as Element);
    expect(ref.current?.state.isHovered).toEqual(false);
  });

  it("handles drag over", () => {
    const preventDefault = jest.fn();
    const ref = React.createRef<DropArea>();
    const { container } = render(<DropArea {...fakeProps()} ref={ref} />);
    expect(ref.current?.state.isHovered).toEqual(false);
    const event = createEvent.dragOver(container.firstChild as Element);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    fireEvent(container.firstChild as Element, event);
    expect(preventDefault).toHaveBeenCalled();
    expect(ref.current?.state.isHovered).toEqual(false);
  });

  it("handles drop", () => {
    const preventDefault = jest.fn();
    const p = fakeProps();
    const ref = React.createRef<DropArea>();
    const { container } = render(<DropArea {...p} ref={ref} />);
    expect(ref.current?.state.isHovered).toEqual(false);
    const event = createEvent.drop(container.firstChild as Element);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    Object.defineProperty(event, "dataTransfer", { value: { getData: () => "key" } });
    fireEvent(container.firstChild as Element, event);
    expect(p.callback).toHaveBeenCalledWith("key");
    expect(preventDefault).toHaveBeenCalled();
    expect(ref.current?.state.isHovered).toEqual(true);
  });
});
