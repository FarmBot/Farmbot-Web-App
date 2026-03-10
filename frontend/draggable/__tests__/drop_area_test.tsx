import React from "react";
import {
  createEvent,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { DropAreaProps } from "../interfaces";

const getDropArea = async () =>
  (await import(`../drop_area.tsx?m=${Math.random()}`)).DropArea;

describe("<DropArea />", () => {
  const fakeProps = (): DropAreaProps => ({
    callback: jest.fn(),
    isLocked: false,
    children: undefined,
  });

  it("opens", async () => {
    const DropArea = await getDropArea();
    const { container } = render(<DropArea {...fakeProps()} />);
    const dropArea = container.firstChild as Element;
    expect(dropArea).toHaveClass("drag-drop-area");
    expect(dropArea).not.toHaveClass("visible");
    fireEvent.dragEnter(dropArea);
    await waitFor(() => expect(dropArea).toHaveClass("visible"));
  });

  it("is locked open", async () => {
    const DropArea = await getDropArea();
    const p = fakeProps();
    p.isLocked = true;
    const { container } = render(<DropArea {...p} />);
    const dropArea = container.firstChild as Element;
    expect(dropArea).toHaveClass("drag-drop-area");
    expect(dropArea).toHaveClass("visible");
  });

  it("renders children", async () => {
    const DropArea = await getDropArea();
    const { container } = render(<DropArea {...fakeProps()}>children</DropArea>);
    expect(container.textContent).toEqual("children");
  });

  it("handles drag enter", async () => {
    const DropArea = await getDropArea();
    const preventDefault = jest.fn();
    const { container } = render(<DropArea {...fakeProps()} />);
    const dropArea = container.firstChild as Element;
    expect(dropArea).not.toHaveClass("visible");
    const event = createEvent.dragEnter(dropArea);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    fireEvent(dropArea, event);
    expect(preventDefault).toHaveBeenCalled();
    await waitFor(() => expect(dropArea).toHaveClass("visible"));
  });

  it("handles drag leave", async () => {
    const DropArea = await getDropArea();
    const { container } = render(<DropArea {...fakeProps()} />);
    const dropArea = container.firstChild as Element;
    fireEvent.dragEnter(dropArea);
    await waitFor(() => expect(dropArea).toHaveClass("visible"));
    fireEvent.dragLeave(dropArea);
    await waitFor(() => expect(dropArea).not.toHaveClass("visible"));
  });

  it("handles drag over", async () => {
    const DropArea = await getDropArea();
    const preventDefault = jest.fn();
    const { container } = render(<DropArea {...fakeProps()} />);
    const dropArea = container.firstChild as Element;
    expect(dropArea).not.toHaveClass("visible");
    const event = createEvent.dragOver(dropArea);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    fireEvent(dropArea, event);
    expect(preventDefault).toHaveBeenCalled();
    expect(dropArea).not.toHaveClass("visible");
  });

  it("handles drop", async () => {
    const DropArea = await getDropArea();
    const preventDefault = jest.fn();
    const p = fakeProps();
    const { container } = render(<DropArea {...p} />);
    const dropArea = container.firstChild as Element;
    expect(dropArea).not.toHaveClass("visible");
    const event = createEvent.drop(dropArea);
    Object.defineProperty(event, "preventDefault", { value: preventDefault });
    Object.defineProperty(event, "dataTransfer", {
      value: { getData: () => "key" },
    });
    fireEvent(dropArea, event);
    expect(p.callback).toHaveBeenCalledWith("key");
    expect(preventDefault).toHaveBeenCalled();
    await waitFor(() => expect(dropArea).toHaveClass("visible"));
  });
});
