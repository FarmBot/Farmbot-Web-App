import React from "react";
import { GridInput, InputCell } from "../grid_input";
import { render, screen, fireEvent } from "@testing-library/react";
import { GridInputProps, InputCellProps, PlantGridData } from "../interfaces";

const testGridInputs = (): PlantGridData => ({
  startX: 11,
  startY: 31,
  spacingH: 5,
  spacingV: 7,
  numPlantsH: 2,
  numPlantsV: 3
});

describe("<GridInput/>", () => {
  const fakeProps = (): GridInputProps => ({
    itemType: "plants",
    disabled: false,
    grid: testGridInputs(),
    xy_swap: true,
    onChange: jest.fn(() => jest.fn()),
    botPosition: { x: undefined, y: undefined, z: undefined },
    onUseCurrentPosition: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<GridInput {...fakeProps()} />);
    expect(container.textContent).toContain("XYStart");
    expect(container.textContent).toContain("# of plants");
    expect(container.textContent).toContain("Spacing (MM)");
  });

  it("renders for points", () => {
    const p = fakeProps();
    p.itemType = "points";
    render(<GridInput {...p} />);
    expect(screen.getByText("# of points")).toBeInTheDocument();
  });

  it("uses current location", () => {
    const p = fakeProps();
    p.botPosition = { x: 1, y: 2, z: 3 };
    render(<GridInput {...p} />);
    fireEvent.click(screen.getByRole("button"));
    expect(p.onUseCurrentPosition).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("doesn't use current location", () => {
    const p = fakeProps();
    render(<GridInput {...p} />);
    fireEvent.click(screen.getByRole("button"));
    expect(p.onChange).not.toHaveBeenCalled();
  });
});

describe("<InputCell/>", () => {
  const fakeProps = (): InputCellProps => ({
    itemType: "plants",
    gridKey: "numPlantsH",
    xy_swap: false,
    onChange: jest.fn(),
    grid: testGridInputs(),
  });

  it("calls onChange", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "6" } });
    expect(p.onChange).not.toHaveBeenCalled();
    expect(input.value).toEqual("6");
  });

  it("calls onChange with no value", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    expect(p.onChange).not.toHaveBeenCalled();
    expect(input.value).toEqual("");
  });

  it("calls onBlur", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.blur(input);
    expect(p.onChange).toHaveBeenCalledWith(p.gridKey, 2);
    expect(input.value).toEqual("2");
  });

  it("calls onBlur with no value", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toEqual("");
    fireEvent.blur(input);
    expect(input.value).toEqual("2");
  });
});
