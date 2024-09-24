import React from "react";
import { mount } from "enzyme";
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
    const wrapper = mount(<PresetButton {...fakeProps()} />);
    expect(wrapper.html()).toContain("box");
    expect(wrapper.html()).toContain("text");
  });

  it("clicks wrapper", () => {
    const p = fakeProps();
    const wrapper = mount(<PresetButton {...p} />);
    wrapper.find({ name: "preset-button-wrapper" }).first().simulate("click");
    expect(p.choosePreset).toHaveBeenCalledWith("preset");
  });

  it("depresses button", () => {
    const p = fakeProps();
    const wrapper = mount(<PresetButton {...p} />);
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
    wrapper.find({ name: "preset-button" }).first().simulate("pointerdown", e);
    expect(e.object.parent.children[0].position.z).toEqual(-10);
    expect(e.object.parent.children[1].position.z).toEqual(16);
  });

  it("hovers button", () => {
    const p = fakeProps();
    p.preset = "preset";
    p.hovered = "preset";
    const wrapper = mount(<PresetButton {...p} />);
    wrapper.find({ name: "preset-button" }).first().simulate("pointerover");
    expect(p.setHovered).toHaveBeenCalledWith("preset");
    expect(document.body.style.cursor).toEqual("pointer");
  });

  it("un-hovers button", () => {
    const p = fakeProps();
    const wrapper = mount(<PresetButton {...p} />);
    wrapper.find({ name: "preset-button" }).first().simulate("pointerleave");
    expect(document.body.style.cursor).toEqual("default");
    expect(p.setHovered).toHaveBeenCalledWith("");
  });

  it("releases button", () => {
    const p = fakeProps();
    const wrapper = mount(<PresetButton {...p} />);
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
    wrapper.find({ name: "preset-button" }).first().simulate("pointerup", e);
    expect(e.object.parent.children[0].position.z).toEqual(0);
    expect(e.object.parent.children[1].position.z).toEqual(26);
  });
});
