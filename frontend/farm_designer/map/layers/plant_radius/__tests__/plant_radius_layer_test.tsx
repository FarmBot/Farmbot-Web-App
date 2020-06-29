import * as React from "react";
import {
  PlantRadiusLayer, PlantRadiusLayerProps, PlantRadius, PlantRadiusProps,
} from "../plant_radius_layer";
import { shallow } from "enzyme";
import { fakePlant } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";

describe("<PlantRadiusLayer />", () => {
  const fakeProps = (): PlantRadiusLayerProps => ({
    plants: [fakePlant()],
    mapTransformProps: fakeMapTransformProps(),
    animate: false,
    visible: true,
  });

  it("shows plant radius", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantRadiusLayer {...p} />);
    expect(wrapper.find(PlantRadius).length).toEqual(1);
  });

  it("toggles visibility off", () => {
    const p = fakeProps();
    p.visible = false;
    const wrapper = shallow(<PlantRadiusLayer {...p} />);
    expect(wrapper.find(PlantRadius).length).toEqual(0);
  });
});

describe("<PlantRadius />", () => {
  const fakeProps = (): PlantRadiusProps => ({
    plant: fakePlant(),
    mapTransformProps: fakeMapTransformProps(),
    visible: true,
    animate: true,
  });

  it("renders plant radius", () => {
    const wrapper = shallow(<PlantRadius {...fakeProps()} />);
    expect(wrapper.find("circle").props().r).toEqual(25);
    expect(wrapper.find("circle").hasClass("animate")).toBeTruthy();
    expect(wrapper.find("circle").props().fill)
      .toEqual("url(#PlantRadiusGradient)");
  });

  it("doesn't animate", () => {
    const p = fakeProps();
    p.animate = false;
    const wrapper = shallow(<PlantRadius {...p} />);
    expect(wrapper.find("circle").hasClass("animate")).toBeFalsy();
  });
});
