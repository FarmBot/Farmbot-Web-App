import React from "react";
import { mount } from "enzyme";
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  PointLight,
} from "../components";
import {
  AmbientLightProps,
  DirectionalLightProps,
  MeshBasicMaterialProps,
  MeshProps,
  PointLightProps,
} from "@react-three/fiber";

describe("<AmbientLight />", () => {
  const fakeProps = (): AmbientLightProps => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<AmbientLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<PointLight />", () => {
  const fakeProps = (): PointLightProps => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<PointLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<DirectionalLight />", () => {
  const fakeProps = (): DirectionalLightProps => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = mount(<DirectionalLight {...fakeProps()} />);
    expect(wrapper.props().intensity).toEqual(0.5);
  });
});

describe("<Mesh />", () => {
  const fakeProps = (): MeshProps => ({
    name: "mesh",
  });

  it("adds props", () => {
    const wrapper = mount(<Mesh {...fakeProps()} />);
    expect(wrapper.props().name).toEqual("mesh");
  });
});

describe("<MeshBasicMaterial />", () => {
  const fakeProps = (): MeshBasicMaterialProps => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = mount(<MeshBasicMaterial {...fakeProps()} />);
    expect(wrapper.props().name).toEqual("material");
  });
});
