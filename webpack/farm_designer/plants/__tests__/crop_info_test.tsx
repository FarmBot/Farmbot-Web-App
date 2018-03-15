jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

let mockPath = "";
const mockHistory = jest.fn();
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => { return mockPath.split("/"); }),
  history: {
    push: mockHistory
  }
}));

import * as React from "react";
import { CropInfo } from "../crop_info";
import { shallow, mount } from "enzyme";
import { CropInfoProps } from "../../interfaces";

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
      }]
    };
  };

  it("renders", () => {
    mockPath = "/app/designer/plants/crop_search/mint";
    const wrapper = mount(<CropInfo {...fakeProps()} />);
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
    expect(mockHistory).toHaveBeenCalledWith(
      "/app/designer/plants/crop_search/mint/add");
  });
});
