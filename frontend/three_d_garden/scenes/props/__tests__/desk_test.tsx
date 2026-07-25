import React from "react";
import { render } from "@testing-library/react";
import {
  Desk, deskPropsEqual, DeskProps, laptopPropsEqual, LaptopProps,
} from "../desk";
import { actRenderer, createRenderer, unmountRenderer } from
  "../../../../__test_support__/test_renderer";
import { MeshPhongMaterial } from "../../../components";

describe("<Desk />", () => {
  const fakeProps = (): DeskProps => ({
    activeFocus: "",
    size: [500, 1000, 600],
    texture: "wood",
    color: "#123456",
  });

  it("renders", () => {
    const { container } = render(<Desk {...fakeProps()} />);
    expect(container.innerHTML).toContain("desk");
  });

  it("renders the requested texture and color", () => {
    const wrapper = createRenderer(<Desk {...fakeProps()} />);
    const materials = wrapper.root.findAllByType(MeshPhongMaterial);

    expect(materials).toHaveLength(5);
    materials.map(material =>
      expect(material.props.color).toEqual("#123456"));
    unmountRenderer(wrapper);
  });

  it("renders the requested color without a texture", () => {
    const wrapper = createRenderer(<Desk
      {...fakeProps()}
      texture={"none"}
      color={"#654321"} />);
    const materials = wrapper.root.findAllByType(MeshPhongMaterial);

    expect(materials).toHaveLength(5);
    materials.map(material =>
      expect(material.props.map).toBeUndefined());
    unmountRenderer(wrapper);
  });

  it("removes an existing texture", () => {
    const wrapper = createRenderer(<Desk {...fakeProps()} />);

    expect(wrapper.root.findAllByType(MeshPhongMaterial)
      .every(material => material.props.map)).toEqual(true);
    actRenderer(() =>
      wrapper.update(<Desk {...fakeProps()} texture={"none"} />));

    const materials = wrapper.root.findAllByType(MeshPhongMaterial);
    expect(materials).toHaveLength(5);
    materials.map(material =>
      expect(material.props.map).toBeUndefined());
    unmountRenderer(wrapper);
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
    expect(deskPropsEqual(p, { ...p, texture: "concrete" })).toBeFalsy();
    expect(deskPropsEqual(p, { ...p, color: "#654321" })).toBeFalsy();
  });

  it("compares laptop-relevant inputs", () => {
    const p: LaptopProps = { size: [337, 300, 200] };
    expect(laptopPropsEqual(p, p)).toBeTruthy();
    expect(laptopPropsEqual(p, { size: [337, 300, 200] })).toBeTruthy();
    expect(laptopPropsEqual(p, { size: [338, 300, 200] })).toBeFalsy();
  });
});
