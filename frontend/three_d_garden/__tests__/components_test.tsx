jest.mock("../components", () => ({
  ...jest.requireActual("../components"),
}));

import React from "react";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Group,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PointLight,
  SpotLight,
} from "../components";
import { ThreeElements } from "@react-three/fiber";
import { createRenderer } from "../../__test_support__/test_renderer";

afterAll(() => {
  jest.unmock("../components");
});
describe("<Group />", () => {
  const fakeProps = (): ThreeElements["group"] => ({
    visible: true,
  });

  it("adds props", () => {
    const wrapper = createRenderer(<Group {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { visible?: boolean } }).props?.visible)
      .toEqual(true);
  });
});

describe("<BoxGeometry />", () => {
  const fakeProps = (): ThreeElements["boxGeometry"] => ({
    name: "box",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<BoxGeometry {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("box");
  });
});

describe("<AmbientLight />", () => {
  const fakeProps = (): ThreeElements["ambientLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = createRenderer(<AmbientLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<PointLight />", () => {
  const fakeProps = (): ThreeElements["pointLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = createRenderer(<PointLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<DirectionalLight />", () => {
  const fakeProps = (): ThreeElements["directionalLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = createRenderer(<DirectionalLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<Mesh />", () => {
  const fakeProps = (): ThreeElements["mesh"] => ({
    name: "mesh",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<Mesh {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("mesh");
  });
});

describe("<LineSegments />", () => {
  const fakeProps = (): ThreeElements["lineSegments"] => ({
    name: "lineSegments",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<LineSegments {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("lineSegments");
  });
});

describe("<InstancedMesh />", () => {
  const fakeProps = (): ThreeElements["instancedMesh"] => ({
    name: "instancedMesh",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<InstancedMesh {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("instancedMesh");
  });
});

describe("<MeshBasicMaterial />", () => {
  const fakeProps = (): ThreeElements["meshBasicMaterial"] => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<MeshBasicMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("material");
  });
});

describe("<LineBasicMaterial />", () => {
  const fakeProps = (): ThreeElements["lineBasicMaterial"] => ({
    name: "lineMaterial",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<LineBasicMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("lineMaterial");
  });
});

describe("<MeshPhongMaterial />", () => {
  const fakeProps = (): ThreeElements["meshPhongMaterial"] => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = createRenderer(<MeshPhongMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("material");
  });
});

describe("<SpotLight />", () => {
  const fakeProps = (): ThreeElements["spotLight"] => ({
    visible: true,
  });

  it("adds props", () => {
    const wrapper = createRenderer(<SpotLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { visible?: boolean } }).props?.visible)
      .toEqual(true);
  });
});
