let mockPath = "";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawAddPlant as AddPlant, AddPlantProps, mapStateToProps,
} from "../add_plant";
import {
  fakeCropLiveSearchResult,
} from "../../../__test_support__/fake_crop_search_result";
import { svgToUrl } from "../../../open_farm/icons";
import { fakeState } from "../../../__test_support__/fake_state";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { fakeWebAppConfig } from "../../../__test_support__/fake_state/resources";

describe("<AddPlant />", () => {
  const fakeProps = (): AddPlantProps => {
    const cropSearchResult = fakeCropLiveSearchResult();
    cropSearchResult.crop.svg_icon = "fake_mint_svg";
    return {
      cropSearchResults: [cropSearchResult],
      dispatch: jest.fn(),
      xy_swap: false,
      openfarmSearch: jest.fn(() => jest.fn()),
    };
  };

  it("renders", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    const p = fakeProps();
    p.dispatch = jest.fn(x => x(jest.fn()));
    const wrapper = mount(<AddPlant {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Preview");
    const img = wrapper.find("img");
    expect(img).toBeDefined();
    expect(img.props().src).toEqual(svgToUrl("fake_mint_svg"));
    expect(p.openfarmSearch).toHaveBeenCalledWith("mint");
  });
});

describe("mapStateToProps", () => {
  it("maps state to props", () => {
    const state = fakeState();
    const crop = fakeCropLiveSearchResult();
    state.resources.consumers.farm_designer.cropSearchResults = [crop];
    const results = mapStateToProps(state);
    expect(results.cropSearchResults).toEqual([crop]);
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
