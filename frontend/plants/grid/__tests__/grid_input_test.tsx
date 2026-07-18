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
    fireEvent.click(screen.getByTitle("(1, 2, 3)"));
    expect(p.onUseCurrentPosition).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
  });

  it("doesn't use current location", () => {
    const p = fakeProps();
    render(<GridInput {...p} />);
    fireEvent.click(screen.getByTitle("(unknown)"));
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("renders stepper carets for every field", () => {
    render(<GridInput {...fakeProps()} />);
    expect(screen.getAllByLabelText(/^Increase/)).toHaveLength(6);
    expect(screen.getAllByLabelText(/^Decrease/)).toHaveLength(6);
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
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole<HTMLInputElement>("spinbutton");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "6" } });
    expect(p.onChange).toHaveBeenCalledWith(p.gridKey, 6);
    expect(input.value).toEqual("6");
  });

  it("calls onChange with no value", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole<HTMLInputElement>("spinbutton");
    fireEvent.change(input, { target: { value: "" } });
    expect(p.onChange).not.toHaveBeenCalled();
    expect(input.value).toEqual("");
  });

  it("calls onBlur", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.blur(input);
    expect(p.onChange).toHaveBeenCalledWith(p.gridKey, 2);
    expect(input.value).toEqual("2");
  });

  it("steps with caret buttons and arrow keys", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    const input = screen.getByRole<HTMLInputElement>("spinbutton");
    fireEvent.click(screen.getByLabelText("Increase # of plants X"));
    expect(p.onChange).toHaveBeenLastCalledWith(p.gridKey, 3);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(p.onChange).toHaveBeenLastCalledWith(p.gridKey, 2);
  });

  it("synchronizes external grid changes", () => {
    const p = fakeProps();
    const { rerender } = render(<InputCell {...p} />);
    const input = screen.getByRole<HTMLInputElement>("spinbutton");
    rerender(<InputCell {...p}
      grid={{ ...p.grid, numPlantsH: 8 }} />);
    expect(input.value).toEqual("8");
  });

  it("calls onBlur with no value", () => {
    const p = fakeProps();
    render(<InputCell {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "" } });
    expect(input.value).toEqual("");
    fireEvent.blur(input);
    expect(input.value).toEqual("2");
  });

  it("rejects partial, decimal, and invalid count values", () => {
    const p = fakeProps();
    p.grid.numPlantsH = 1;
    render(<InputCell {...p} />);
    const input = screen.getByRole<HTMLInputElement>("spinbutton");

    fireEvent.change(input, { target: { value: "-" } });
    fireEvent.change(input, { target: { value: "1.5" } });
    fireEvent.blur(input);
    expect(input).toHaveValue(1);
    expect(p.onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByLabelText("Decrease # of plants X"));
    expect(input).toHaveValue(1);
  });

  it("skips zero while stepping signed spacing", () => {
    const p = fakeProps();
    p.gridKey = "spacingV";
    p.grid.spacingV = 1;
    render(<InputCell {...p} />);
    const input = screen.getByRole<HTMLInputElement>("spinbutton");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(p.onChange).toHaveBeenCalledWith("spacingV", -1);
    expect(input).toHaveValue(-1);
    fireEvent.change(input, { target: { value: "0" } });
    expect(p.onChange).toHaveBeenCalledTimes(1);
  });

  it("accepts signed starting positions", () => {
    const p = fakeProps();
    p.gridKey = "startY";
    render(<InputCell {...p} />);
    fireEvent.change(screen.getByRole("spinbutton"), {
      target: { value: "-12" },
    });
    expect(p.onChange).toHaveBeenCalledWith("startY", -12);
  });
});
