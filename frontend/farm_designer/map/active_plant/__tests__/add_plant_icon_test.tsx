import { Path, FilePath } from "../../../../internal_urls";
let mockPath = Path.mock(Path.cropSearch());
jest.mock("../../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

import { mount } from "enzyme";
import React from "react";
import { AddPlantIcon, AddPlantIconProps } from "../add_plant_icon";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import {
  fakeCropLiveSearchResult,
} from "../../../../__test_support__/fake_crop_search_result";
import { svgToUrl } from "../../../../open_farm/icons";

describe("<AddPlantIcon />", () => {
  const fakeProps = (): AddPlantIconProps => ({
    cursorPosition: { x: 1, y: 2 },
    cropSearchResults: [fakeCropLiveSearchResult()],
    mapTransformProps: fakeMapTransformProps(),
  });

  it("returns icon", () => {
    const wrapper = mount(<AddPlantIcon {...fakeProps()} />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().xlinkHref).toEqual(FilePath.DEFAULT_ICON);
  });

  it("doesn't return icon", () => {
    const p = fakeProps();
    p.cursorPosition = undefined;
    const wrapper = mount(<AddPlantIcon {...p} />);
    expect(wrapper.find("image").length).toEqual(0);
  });

  it("returns specific icon", () => {
    mockPath = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const result = fakeCropLiveSearchResult();
    result.crop.svg_icon = "fake_icon";
    p.cropSearchResults = [result];
    const wrapper = mount(<AddPlantIcon {...p} />);
    expect(wrapper.find("image").length).toEqual(1);
    expect(wrapper.find("image").props().xlinkHref).toEqual(svgToUrl("fake_icon"));
  });
});
