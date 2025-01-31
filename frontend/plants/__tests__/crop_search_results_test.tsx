jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { CropSearchResults, SearchResultProps } from "../crop_search_results";
import { fakePlant } from "../../__test_support__/fake_state/resources";
import { Path } from "../../internal_urls";
import { Actions } from "../../constants";
import { edit, save } from "../../api/crud";

describe("<CropSearchResults />", () => {
  const fakeProps = (): SearchResultProps => ({
    searchTerm: "mint",
    plant: undefined,
    dispatch: jest.fn(),
    bulkPlantSlug: undefined,
    hoveredPlant: { plantUUID: undefined },
  });

  it("renders CropSearchResults", () => {
    const p = fakeProps();
    const wrapper = mount(<CropSearchResults {...p} />);
    const text = wrapper.text();
    expect(text).toContain("Mint");
    expect(wrapper.find("Link").length).toEqual(1);
    expect(wrapper.find("Link").first().prop("to")).toContain("mint");
  });

  it("renders for plant type change", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    const wrapper = mount(<CropSearchResults {...p} />);
    expect(wrapper.text()).toContain("Mint");
    expect(wrapper.find("Link").first().prop("to"))
      .toEqual(Path.plants(1));
    const icon = wrapper.find("img");
    expect(icon.hasClass("center")).toBeFalsy();
  });

  it("renders without image", () => {
    const p = fakeProps();
    p.searchTerm = "foo-bar";
    const wrapper = mount(<CropSearchResults {...p} />);
    const icon = wrapper.find("img");
    expect(icon.hasClass("center")).toBeTruthy();
  });

  it("changes plant type", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    const wrapper = mount(<CropSearchResults {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PLANT_TYPE_CHANGE_ID,
      payload: undefined,
    });
    expect(edit).toHaveBeenCalledWith(p.plant, {
      name: "Mint",
      openfarm_slug: "mint",
    });
    expect(save).toHaveBeenCalledWith(p.plant.uuid);
  });

  it("changes plant type and hover", () => {
    const p = fakeProps();
    p.plant = fakePlant();
    p.plant.body.id = 1;
    p.hoveredPlant = { plantUUID: p.plant.uuid };
    const wrapper = mount(<CropSearchResults {...p} />);
    wrapper.find("Link").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_PLANT,
      payload: { plantUUID: p.plant.uuid },
    });
  });

  it("sets bulk slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    const wrapper = mount(<CropSearchResults {...p} />);
    const link = wrapper.find("Link").first();
    expect(link.prop("to")).toEqual(Path.plants("select"));
    link.simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SLUG_BULK,
      payload: "mint",
    });
    expect(edit).not.toHaveBeenCalled();
  });
});
