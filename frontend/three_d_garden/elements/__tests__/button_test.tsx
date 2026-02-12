import React from "react";
import TestRenderer from "react-test-renderer";
import { render } from "@testing-library/react";
import { PresetButton, PresetButtonProps } from "../button";

describe("<PresetButton />", () => {
  const fakeProps = (): PresetButtonProps => ({
    preset: "preset",
    choosePreset: jest.fn(() => jest.fn()),
    hovered: "",
    setHovered: jest.fn(),
    startPosition: { x: 0, y: 0, z: 0 },
    index: 0,
  });

  it("renders", () => {
    const { container } = render(<PresetButton {...fakeProps()} />);
    expect(container.innerHTML).toContain("box");
    expect(container.innerHTML).toContain("text");
  });

  it("clicks wrapper", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<PresetButton {...p} />);
    wrapper.root.findAll(node => node.props.name == "preset-button-wrapper")[0]
      ?.props.onClick();
    expect(p.choosePreset).toHaveBeenCalledWith("preset");
    wrapper.unmount();
  });

  it("depresses button", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<PresetButton {...p} />);
    const e = {
      object: {
        parent: {
          children: [
            { name: "btn", position: { z: 0 }, children: [] },
            { name: "not-btn", position: { z: 0 }, children: [] },
          ]
        }
      }
    };
    wrapper.root.findAll(node => node.props.name == "preset-button")[0]
      ?.props.onPointerDown(e);
    expect(e.object.parent.children[0].position.z).toEqual(-10);
    expect(e.object.parent.children[1].position.z).toEqual(16);
    wrapper.unmount();
  });

  it("hovers button", () => {
    const p = fakeProps();
    p.preset = "preset";
    p.hovered = "preset";
    const wrapper = TestRenderer.create(<PresetButton {...p} />);
    wrapper.root.findAll(node => node.props.name == "preset-button")[0]
      ?.props.onPointerOver();
    expect(p.setHovered).toHaveBeenCalledWith("preset");
    expect(document.body.style.cursor).toEqual("pointer");
    wrapper.unmount();
  });

  it("un-hovers button", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<PresetButton {...p} />);
    wrapper.root.findAll(node => node.props.name == "preset-button")[0]
      ?.props.onPointerLeave();
    expect(document.body.style.cursor).toEqual("default");
    expect(p.setHovered).toHaveBeenCalledWith("");
    wrapper.unmount();
  });

  it("releases button", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<PresetButton {...p} />);
    const e = {
      object: {
        parent: {
          children: [
            { name: "btn", position: { z: 0 }, children: [] },
            { name: "not-btn", position: { z: 0 }, children: [] },
          ]
        }
      }
    };
    wrapper.root.findAll(node => node.props.name == "preset-button")[0]
      ?.props.onPointerUp(e);
    expect(e.object.parent.children[0].position.z).toEqual(0);
    expect(e.object.parent.children[1].position.z).toEqual(26);
    wrapper.unmount();
  });
});
