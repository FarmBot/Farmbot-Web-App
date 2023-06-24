let mockPath = "";
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: jest.fn(() => mockPath.split("/")),
}));

import React from "react";
import { mount } from "enzyme";
import {
  RawAddPlant as AddPlant, AddPlantProps, mapStateToProps,
} from "../add_plant";
import {
  fakeCropLiveSearchResult,
} from "../../__test_support__/fake_crop_search_result";
import { svgToUrl } from "../../open_farm/icons";
import { fakeState } from "../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import {
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";

describe("<AddPlant />", () => {
  const fakeProps = (): AddPlantProps => {
    const designer = fakeDesignerState();
    const cropSearchResult = fakeCropLiveSearchResult();
    cropSearchResult.crop.svg_icon = "fake_mint_svg";
    designer.cropSearchResults = [cropSearchResult];
    return {
      designer,
      dispatch: jest.fn(),
      xy_swap: false,
      openfarmCropFetch: jest.fn(() => jest.fn()),
      botPosition: { x: undefined, y: undefined, z: undefined },
    };
  };

  it("renders", () => {
    mockPath = Path.mock(Path.cropSearch("mint/add"));
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<AddPlant {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Preview");
    const img = wrapper.find("img");
    expect(img).toBeDefined();
    expect(img.props().src).toEqual(svgToUrl("fake_mint_svg"));
    expect(p.openfarmCropFetch).toHaveBeenCalledWith("mint");
  });
});

describe("mapStateToProps", () => {
  it("maps state to props", () => {
    const state = fakeState();
    const results = mapStateToProps(state);
    expect(results.designer.cropSearchResults).toEqual([]);
    expect(results.xy_swap).toEqual(false);
  });

  it("returns xy_swap equals true", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.xy_swap = true;
    state.resources = buildResourceIndex([webAppConfig]);
    const results = mapStateToProps(state);
    expect(results.xy_swap).toEqual(true);
  });
});
