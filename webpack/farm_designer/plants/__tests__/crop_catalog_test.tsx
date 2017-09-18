jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { CropCatalog } from "../crop_catalog";
import { mount } from "enzyme";

describe("<CropCatalog />", () => {
  it("renders", () => {
    const wrapper = mount(
      <CropCatalog
        OFSearch={jest.fn()}
        dispatch={jest.fn()}
        cropSearchResults={[]}
        cropSearchQuery={""} />);
    expect(wrapper.text()).toContain("Choose a crop");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search OpenFarm...");
  });
});
