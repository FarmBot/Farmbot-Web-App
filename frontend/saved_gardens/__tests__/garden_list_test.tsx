jest.mock("../actions", () => ({ openSavedGarden: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { GardenInfo, SavedGardenList } from "../garden_list";
import { fakeSavedGarden } from "../../__test_support__/fake_state/resources";
import { SavedGardenInfoProps, SavedGardenListProps } from "../interfaces";
import { openSavedGarden } from "../actions";

describe("<GardenInfo />", () => {
  const fakeProps = (): SavedGardenInfoProps => ({
    savedGarden: fakeSavedGarden(),
    plantTemplateCount: 0,
    dispatch: jest.fn(),
  });

  it("opens garden", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenInfo {...p} />);
    wrapper.simulate("click");
    expect(openSavedGarden).toHaveBeenCalledWith(expect.any(Function),
      p.savedGarden.body.id);
  });
});

describe("<SavedGardenList />", () => {
  const fakeProps = (): SavedGardenListProps => ({
    savedGardens: [fakeSavedGarden()],
    plantTemplates: [],
    dispatch: jest.fn(),
    plantPointerCount: 1,
    openedSavedGarden: undefined,
    searchTerm: "",
  });

  it("renders saved gardens", () => {
    const wrapper = mount(<SavedGardenList {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("saved garden");
  });

  it("handles missing name", () => {
    const p = fakeProps();
    const savedGarden = fakeSavedGarden();
    savedGarden.body.name = "";
    p.savedGardens = [savedGarden];
    const wrapper = mount(<SavedGardenList {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("0 plants");
  });
});
