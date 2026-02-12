import React from "react";
import { render } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import { LocationSelection, LocationDisplay } from "../location_selection";
import { LocationSelectionProps } from "../interfaces";

describe("<LocationSelection />", () => {
  function fakeProps(): LocationSelectionProps {
    return {
      xyzLocation: undefined,
      deviation: 0,
      setLocation: jest.fn(),
      setDeviation: jest.fn(),
    };
  }

  it("renders", () => {
    const { container } = render(<LocationSelection {...fakeProps()} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "deviation"]
      .map(string => expect(txt).toContain(string));
  });

  it("changes location", () => {
    const p = fakeProps();
    p.xyzLocation = { x: 10, y: 20, z: 30 };
    const wrapper = TestRenderer.create(<LocationSelection {...p} />);
    const axisInput = wrapper.root.find(node =>
      node.props.axis == "x"
      && typeof node.props.onChange == "function");
    axisInput.props.onChange("x", 10);
    expect(p.setLocation).toHaveBeenCalledWith({ x: 10, y: 20, z: 30 });
    wrapper.unmount();
  });

  it("changes location: undefined", () => {
    const p = fakeProps();
    p.xyzLocation = undefined;
    const wrapper = TestRenderer.create(<LocationSelection {...p} />);
    const axisInput = wrapper.root.find(node =>
      node.props.axis == "x"
      && typeof node.props.onChange == "function");
    axisInput.props.onChange("x", undefined);
    expect(p.setLocation).toHaveBeenCalledWith({ x: undefined });
    wrapper.unmount();
  });

  it("changes deviation", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<LocationSelection {...p} />);
    const input = wrapper.root.find(node =>
      node.props.type == "number"
      && typeof node.props.onCommit == "function"
      && node.props.value === 0);
    input.props.onCommit({
      currentTarget: { value: "100" },
      target: { value: "100" },
    });
    expect(p.setDeviation).toHaveBeenCalledWith(100);
    wrapper.unmount();
  });
});

describe("<LocationDisplay />", () => {
  it("renders location ranges", () => {
    const p = { xyzLocation: { x: 10, y: 20, z: 30 }, deviation: 2 };
    const { container } = render(<LocationDisplay {...p} />);
    const txt = container.textContent?.toLowerCase() || "";
    ["x", "y", "z", "8–12", "18–22", "28–32"]
      .map(string => expect(txt).toContain(string));
  });
});
