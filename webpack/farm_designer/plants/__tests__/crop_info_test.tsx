jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

let mockPath = "";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: { push: jest.fn() }
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn()
}));

import * as React from "react";
import { CropInfo } from "../crop_info";
import { shallow, mount } from "enzyme";
import { CropInfoProps } from "../../interfaces";
import { initSave } from "../../../api/crud";
import { history } from "../../../history";

describe("<CropInfo />", () => {
  const fakeProps = (): CropInfoProps => {
    return {
      OFSearch: jest.fn(),
      dispatch: jest.fn(),
      cropSearchResults: [{
        image: "a",
        crop: {
          name: "Mint",
          slug: "mint",
          binomial_name: "",
          common_names: [""],
          description: "",
          sun_requirements: "",
          sowing_method: "",
          row_spacing: 100,
          processing_pictures: 1,
          svg_icon: "fake_mint_svg"
        }
      }],
      botPosition: { x: undefined, y: undefined, z: undefined },
    };
  };

  it("renders", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper =mount<>(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Drag and drop into map");
    expect(wrapper.text()).toContain("Row Spacing1000mm");
    expect(wrapper.find("img").last().props().src)
      .toEqual("data:image/svg+xml;utf8,fake_mint_svg");
  });

  it("navigates to /add", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = shallow(<CropInfo {...fakeProps()} />);
    wrapper.find(".right-button").simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/mint/add");
  });

  it("returns to crop search", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = shallow(<CropInfo {...fakeProps()} />);
    wrapper.find(".plant-panel-back-arrow").simulate("click");
    expect(history.push).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/");
  });

  it("disables 'add plant @ UTM' button", () => {
    const wrapper = shallow(<CropInfo {...fakeProps()} />);
    expect(wrapper.text()).toContain("location (unknown)");
  });

  it("adds a plant at the current bot position", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: 200, z: undefined };
    const wrapper = shallow(<CropInfo {...p} />);
    const button = wrapper.find("button").last();
    expect(button.text()).toContain("location (100, 200)");
    button.simulate("click");
    expect(initSave).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({
        name: "Mint",
        x: 100,
        y: 200,
        z: 0
      })
    }));
  });
});
