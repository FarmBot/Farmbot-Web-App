import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { BackArrow } from "../back_arrow";

describe("<BackArrow />", () => {
  it("renders", () => {
    const { container } = render(<BackArrow />);
    expect(container.querySelector(".back-arrow")).toBeTruthy();
    expect(container.querySelector(".fa-arrow-left")).toBeTruthy();
  });

  it("triggers callbacks", () => {
    const cb = jest.fn();
    const { container } = render(<BackArrow onClick={cb} />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(cb).toHaveBeenCalled();
  });

  it("doesn't trigger callback", () => {
    history.back = jest.fn();
    const { container } = render(<BackArrow />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(history.back).toHaveBeenCalled();
  });
});
