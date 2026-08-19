import React from "react";
import { fireEvent, render } from "@testing-library/react";
import {
  isWebGLAvailable, ThreeDGuard,
} from "../three_d_required_overlay";

afterEach(() => jest.restoreAllMocks());

describe("isWebGLAvailable()", () => {
  it("detects WebGL", () => {
    expect(isWebGLAvailable()).toEqual(true);
  });

  it("handles context errors", () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockImplementation((() => { throw new Error("no WebGL"); }) as never);
    expect(isWebGLAvailable()).toEqual(false);
  });
});

describe("<ThreeDGuard />", () => {
  it("renders children when WebGL is available", () => {
    const { container } = render(<ThreeDGuard>
      <div className={"three-d-content"} />
    </ThreeDGuard>);
    expect(container.querySelector(".three-d-content")).toBeTruthy();
    expect(container.querySelector(".three-d-required-overlay")).toBeFalsy();
  });

  it("renders guidance when WebGL is unavailable", () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockImplementation((() => null) as never);
    const { container } = render(<ThreeDGuard>
      <div className={"three-d-content"} />
    </ThreeDGuard>);
    expect(container.querySelector(".three-d-content")).toBeFalsy();
    expect(container.textContent).toContain("3D graphics unavailable");
    expect(container.textContent).toContain("Enable WebGL");
    expect(container.querySelector(".three-d-required-toggle")).toBeFalsy();
  });

  it("switches to 2D", () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext")
      // eslint-disable-next-line no-null/no-null
      .mockImplementation((() => null) as never);
    const onSwitchTo2D = jest.fn();
    const { container } = render(
      <ThreeDGuard onSwitchTo2D={onSwitchTo2D}><div /></ThreeDGuard>);
    const toggle = container.querySelector(".fb-toggle-button");
    toggle && fireEvent.click(toggle);
    expect(onSwitchTo2D).toHaveBeenCalledTimes(1);
    expect(container.textContent).toContain("2D");
    expect(container.textContent).toContain("3D");
  });
});
