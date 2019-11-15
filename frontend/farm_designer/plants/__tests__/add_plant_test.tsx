let mockPath = "";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: jest.fn(() => { return mockPath.split("/"); })
}));

import * as React from "react";
import { mount } from "enzyme";
import { RawAddPlant as AddPlant, AddPlantProps } from "../add_plant";
import { history } from "../../../history";
import {
  fakeCropLiveSearchResult
} from "../../../__test_support__/fake_crop_search_result";
import { svgToUrl } from "../../../open_farm/icons";

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
    const wrapper = mount(<AddPlant {...fakeProps()} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Done");
    expect(wrapper.find("img").props().src)
      .toEqual(svgToUrl("fake_mint_svg"));
  });

  it("goes back", () => {
    const wrapper = mount(<AddPlant {...fakeProps()} />);
    const doneBtn = wrapper.find("a").first();
    expect(doneBtn.text()).toEqual("Done");
    doneBtn.simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/mint");
  });
});
