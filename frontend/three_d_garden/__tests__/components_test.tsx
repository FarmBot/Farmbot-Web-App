jest.mock("../components", () => ({
  ...jest.requireActual("../components"),
}));

import React from "react";
import { mount } from "enzyme";
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  PointLight,
} from "../components";
import { ThreeElements } from "@react-three/fiber";

describe("<Group />", () => {
  const fakeProps = (): ThreeElements["group"] => ({
    visible: true,
  });

  it("adds props", () => {
    const wrapper = mount(<Group {...fakeProps()} />);
    expect(wrapper.props().visible).toEqual(true);
  });
});

describe("<AmbientLight />", () => {
  const fakeProps = (): ThreeElements["ambientLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<AmbientLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<PointLight />", () => {
  const fakeProps = (): ThreeElements["pointLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<PointLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<DirectionalLight />", () => {
  const fakeProps = (): ThreeElements["directionalLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<DirectionalLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<Mesh />", () => {
  const fakeProps = (): ThreeElements["mesh"] => ({
    name: "mesh",
  });

  it("adds props", () => {
    const wrapper = mount(<Mesh {...fakeProps()} />);
    expect(wrapper.props().name).toEqual("mesh");
  });
});

describe("<MeshBasicMaterial />", () => {
  const fakeProps = (): ThreeElements["meshBasicMaterial"] => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = mount(<MeshBasicMaterial {...fakeProps()} />);
    expect(wrapper.props().name).toEqual("material");
  });
});
