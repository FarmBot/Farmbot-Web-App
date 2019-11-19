let mockPath = "";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { render } from "enzyme";
import { RawAddPlant as AddPlant, AddPlantProps, mapStateToProps } from "../add_plant";
import {
  fakeCropLiveSearchResult
} from "../../../__test_support__/fake_crop_search_result";
import { svgToUrl } from "../../../open_farm/icons";
import { fakeState } from "../../../__test_support__/fake_state";
import { CropLiveSearchResult } from "../../interfaces";

describe("<AddPlant />", () => {
  const fakeProps = (): AddPlantProps => {
    const cropSearchResult = fakeCropLiveSearchResult();
    cropSearchResult.crop.svg_icon = "fake_mint_svg";
    return {
      cropSearchResults: [cropSearchResult],
      dispatch: jest.fn(),
      xy_swap: false,
      openfarmSearch: jest.fn(),
    };
  };

  it("renders", () => {
    mockPath = "/app/designer/plants/crop_search/mint/add";
    const wrapper = render(<AddPlant {...fakeProps()} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Preview");
    const img = wrapper.find("img");
    expect(img).toBeDefined();
    expect(img.attr("src")).toEqual(svgToUrl("fake_mint_svg"));
  });
});

describe("mapStateToProps", () => {
  it("maps state to props", () => {
    const state = fakeState();
    const crop: CropLiveSearchResult = {
      crop: {
        name: "fake",
        slug: "fake",
        binomial_name: "fake",
        common_names: ["fake"],
        description: "",
        sun_requirements: "",
        sowing_method: "",
        processing_pictures: 0
      },
      image: "X"
    };
    state.resources.consumers.farm_designer.cropSearchResults = [crop];
    const results = mapStateToProps(state);
    expect(results.cropSearchResults).toEqual([crop]);
    expect(results.xy_swap).toEqual(false);
  });
});
