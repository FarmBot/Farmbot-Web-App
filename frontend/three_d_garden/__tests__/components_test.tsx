jest.mock("../components", () => ({
  ...jest.requireActual("../components"),
}));

import React from "react";
import TestRenderer from "react-test-renderer";
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

afterAll(() => {
  jest.unmock("../components");
});
describe("<Group />", () => {
  const fakeProps = (): ThreeElements["group"] => ({
    visible: true,
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<Group {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { visible?: boolean } }).props?.visible)
      .toEqual(true);
  });
});

describe("<BoxGeometry />", () => {
  const fakeProps = (): ThreeElements["boxGeometry"] => ({
    name: "box",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<BoxGeometry {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("box");
  });
});

describe("<AmbientLight />", () => {
  const fakeProps = (): ThreeElements["ambientLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<AmbientLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<PointLight />", () => {
  const fakeProps = (): ThreeElements["pointLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<PointLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<DirectionalLight />", () => {
  const fakeProps = (): ThreeElements["directionalLight"] => ({
    intensity: 0.5,
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<DirectionalLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { intensity?: number } }).props?.intensity)
      .toEqual(0.5);
  });
});

describe("<Mesh />", () => {
  const fakeProps = (): ThreeElements["mesh"] => ({
    name: "mesh",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<Mesh {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("mesh");
  });
});

describe("<LineSegments />", () => {
  const fakeProps = (): ThreeElements["lineSegments"] => ({
    name: "lineSegments",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<LineSegments {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("lineSegments");
  });
});

describe("<InstancedMesh />", () => {
  const fakeProps = (): ThreeElements["instancedMesh"] => ({
    name: "instancedMesh",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<InstancedMesh {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("instancedMesh");
  });
});

describe("<MeshBasicMaterial />", () => {
  const fakeProps = (): ThreeElements["meshBasicMaterial"] => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<MeshBasicMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("material");
  });
});

describe("<LineBasicMaterial />", () => {
  const fakeProps = (): ThreeElements["lineBasicMaterial"] => ({
    name: "lineMaterial",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<LineBasicMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("lineMaterial");
  });
});

describe("<MeshPhongMaterial />", () => {
  const fakeProps = (): ThreeElements["meshPhongMaterial"] => ({
    name: "material",
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<MeshPhongMaterial {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { name?: string } }).props?.name)
      .toEqual("material");
  });
});

describe("<SpotLight />", () => {
  const fakeProps = (): ThreeElements["spotLight"] => ({
    visible: true,
  });

  it("adds props", () => {
    const wrapper = TestRenderer.create(<SpotLight {...fakeProps()} />);
    expect((wrapper.toJSON() as { props?: { visible?: boolean } }).props?.visible)
      .toEqual(true);
  });
});
