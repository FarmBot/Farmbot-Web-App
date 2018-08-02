jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { CropCatalog } from "../crop_catalog";
import { mount, shallow } from "enzyme";
import { CropCatalogProps } from "../../interfaces";
import { Actions } from "../../../constants";
import { history } from "../../../history";

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => {
    return {
      dispatch: jest.fn(),
      OFSearch: jest.fn(),
      cropSearchResults: [],
      cropSearchQuery: "",
    };
  };

  it("renders", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    expect(wrapper.text()).toContain("Choose a crop");
    expect(wrapper.find("input").props().placeholder)
      .toEqual("Search OpenFarm...");
  });

  it("handles search term change", () => {
    const p = fakeProps();
    const wrapper = shallow(<CropCatalog {...p} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "apple" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: "apple",
      type: Actions.SEARCH_QUERY_CHANGE
    });
  });

  it("goes back", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });
});
