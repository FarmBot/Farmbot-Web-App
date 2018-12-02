jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("lodash", () => ({ debounce: jest.fn(x => x) }));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { CropCatalog } from "../crop_catalog";
import { mount, shallow } from "enzyme";
import { CropCatalogProps } from "../../interfaces";
import { Actions } from "../../../constants";
import { history } from "../../../history";
import {
  fakeCropLiveSearchResult
} from "../../../__test_support__/fake_crop_search_result";

describe("<CropCatalog />", () => {
  const fakeProps = (): CropCatalogProps => {
    return {
      dispatch: jest.fn(),
      openfarmSearch: jest.fn(() => jest.fn()),
      cropSearchResults: [],
      cropSearchQuery: "",
      cropSearchInProgress: false,
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
    // Requires lodash.debouce to be mocked
    expect(p.openfarmSearch).toHaveBeenCalledWith("apple");
  });

  it("goes back", () => {
    const wrapper = mount(<CropCatalog {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("search term is too short", () => {
    const p = fakeProps();
    p.cropSearchQuery = "ab";
    const wrapper = mount(<CropCatalog {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("too short");
  });

  it("shows result update spinner", () => {
    const p = fakeProps();
    p.cropSearchQuery = "abc";
    p.cropSearchInProgress = true;
    p.cropSearchResults = [fakeCropLiveSearchResult()];
    const wrapper = shallow(<CropCatalog {...p} />);
    expect(wrapper.find("Spinner").length).toEqual(1);
  });
});
