jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../search_selectors", () => ({
  findBySlug: () => {
    return {
      image: "", crop: {
        name: "Mint",
        slug: "mint",
        binomial_name: "",
        common_names: [""],
        description: "",
        sun_requirements: "",
        sowing_method: "",
        processing_pictures: 1,
        svg_icon: "fake_mint_svg"
      }
    };
  }
}));

import * as React from "react";
import { CropInfo } from "../crop_info";
import { shallow } from "enzyme";

describe("<CropInfo />", () => {
  it("renders", () => {
    Object.defineProperty(location, "pathname", {
      value: "/app/designer/plants/crop_search/mint"
    });
    const wrapper = shallow(
      <CropInfo
        OFSearch={jest.fn()}
        dispatch={jest.fn()}
        cropSearchResults={[]} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Drag and drop into map");
    expect(wrapper.find("img").last().props().src)
      .toEqual("data:image/svg+xml;utf8,fake_mint_svg");
  });
});
