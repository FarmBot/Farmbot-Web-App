import React from "react";
import { render } from "@testing-library/react";
import { Text, textPropsEqual, TextProps } from "../text";

describe("<Text />", () => {
  const fakeProps = (): TextProps => ({
    children: "text",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    fontSize: 10,
    color: "black",
  });

  it("renders", () => {
    const { container } = render(<Text {...fakeProps()} />);
    expect(container).toContainHTML("text");
  });

  it("compares rendered text inputs", () => {
    const p = fakeProps();
    expect(textPropsEqual(p, {
      ...p,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
    })).toBeTruthy();
    expect(textPropsEqual(p, {
      ...p,
      children: "other",
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      position: [0, 1, 0],
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      rotation: [0, 0, 1],
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      visible: false,
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      depthTest: false,
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      opacity: 0.5,
    })).toBeFalsy();
  });
});
