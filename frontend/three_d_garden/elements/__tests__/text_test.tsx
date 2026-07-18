import React from "react";
import { render } from "@testing-library/react";
import { Text, textPropsEqual, TextProps } from "../text";
import {
  createRenderer, unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { noControlRaycast } from "../../controls";

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
    const foreground = createRenderer(<Text
      {...fakeProps()}
      transparent={true}
      depthTest={false}
      depthWrite={false}
      raycast={noControlRaycast} />);
    const material = foreground.root.find(node =>
      node.type == "div" && node.props.color == "black");
    const text = foreground.root.find(node =>
      node.props.font && node.props.raycast == noControlRaycast);
    expect(material.props.transparent).toEqual(true);
    expect(material.props.depthTest).toEqual(false);
    expect(material.props.depthWrite).toEqual(false);
    expect(text.props.raycast).toBe(noControlRaycast);
    unmountRenderer(foreground);
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
      depthWrite: false,
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      transparent: true,
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      opacity: 0.5,
    })).toBeFalsy();
    expect(textPropsEqual(p, {
      ...p,
      raycast: noControlRaycast,
    })).toBeFalsy();
  });
});
