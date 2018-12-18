jest.mock("../actions", () => ({
  openOrCloseGarden: jest.fn(),
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { shallow, mount } from "enzyme";
import {
  fakeSavedGarden, fakePlantTemplate
} from "../../../__test_support__/fake_state/resources";
import { edit } from "../../../api/crud";
import { GardenInfo, SavedGardenList } from "../garden_list";
import { SavedGardenInfoProps, SavedGardensProps } from "../interfaces";

describe("<GardenInfo />", () => {
  const fakeProps = (): SavedGardenInfoProps => ({
    dispatch: jest.fn(),
    savedGarden: fakeSavedGarden(),
    gardenIsOpen: false,
    plantTemplateCount: 0,
  });

  it("edits garden name", () => {
    const wrapper = shallow(<GardenInfo {...fakeProps()} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "new name" } });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "new name" });
  });
});

describe("<SavedGardenList />", () => {
  const fakeProps = (): SavedGardensProps => {
    const fakeSG = fakeSavedGarden();
    return {
      dispatch: jest.fn(),
      plantPointerCount: 1,
      savedGardens: [fakeSG],
      plantTemplates: [fakePlantTemplate(), fakePlantTemplate()],
      openedSavedGarden: fakeSG.uuid,
    };
  };

  it("renders open garden", () => {
    const wrapper = mount(<SavedGardenList {...fakeProps()} />);
    expect(wrapper.text()).toContain("exit");
  });

  it("renders gardens closed", () => {
    const p = fakeProps();
    p.openedSavedGarden = undefined;
    const wrapper = mount(<SavedGardenList {...p} />);
    expect(wrapper.text()).not.toContain("exit");
  });
});
