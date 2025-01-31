import { mount } from "enzyme";
import React from "react";
import { AddPlantIcon, AddPlantIconProps } from "../add_plant_icon";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import { Path } from "../../../../internal_urls";
import {
  fakeDesignerState,
} from "../../../../__test_support__/fake_designer_state";

describe("<AddPlantIcon />", () => {
  const fakeProps = (): AddPlantIconProps => ({
    designer: fakeDesignerState(),
    cursorPosition: { x: 1, y: 2 },
    mapTransformProps: fakeMapTransformProps(),
  });

  it("returns icon", () => {
    const wrapper = mount(<AddPlantIcon {...fakeProps()} />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().xlinkHref)
      .toEqual("/crops/icons/generic-plant.avif");
  });

  it("doesn't return icon", () => {
    const p = fakeProps();
    p.cursorPosition = undefined;
    const wrapper = mount(<AddPlantIcon {...p} />);
    expect(wrapper.find("image").length).toEqual(0);
  });

  it("returns specific icon", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const wrapper = mount(<AddPlantIcon {...p} />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().xlinkHref)
      .toEqual("/crops/icons/mint.avif");
  });
});
