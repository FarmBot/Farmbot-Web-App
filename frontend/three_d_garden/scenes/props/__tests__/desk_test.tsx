import React from "react";
import { render } from "@testing-library/react";
import {
  Desk, deskPropsEqual, DeskProps, laptopPropsEqual, LaptopProps,
} from "../desk";

describe("<Desk />", () => {
  const fakeProps = (): DeskProps => ({
    activeFocus: "",
    size: [500, 1000, 600],
  });

  it("renders", () => {
    const { container } = render(<Desk {...fakeProps()} />);
    expect(container.innerHTML).toContain("desk");
  });

  it("compares desk-relevant inputs", () => {
    const p = fakeProps();
    expect(deskPropsEqual(p, { ...p })).toBeTruthy();
    expect(deskPropsEqual(p, {
      ...p,
      activeFocus: "Planter bed",
    })).toBeFalsy();
    expect(deskPropsEqual(p, {
      ...p,
      size: [501, 1000, 600],
    })).toBeFalsy();
  });

  it("compares laptop-relevant inputs", () => {
    const p: LaptopProps = { size: [337, 300, 200] };
    expect(laptopPropsEqual(p, p)).toBeTruthy();
    expect(laptopPropsEqual(p, { size: [337, 300, 200] })).toBeTruthy();
    expect(laptopPropsEqual(p, { size: [338, 300, 200] })).toBeFalsy();
  });
});
