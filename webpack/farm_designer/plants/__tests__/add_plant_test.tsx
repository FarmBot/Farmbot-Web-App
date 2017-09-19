jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { AddPlant, AddPlantProps } from "../add_plant";

describe("<AddPlant />", () => {
  it("renders", () => {
    const props: AddPlantProps = {
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
          processing_pictures: 1,
          svg_icon: "fake_mint_svg"
        }
      }]
    };
    Object.defineProperty(location, "pathname", {
      value: "//app/plants/crop_search/mint/add"
    });
    const wrapper = mount(<AddPlant {...props} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.text()).toContain("Done");
    expect(wrapper.find("img").props().src)
      .toEqual("data:image/svg+xml;utf8,fake_mint_svg");
  });
});
