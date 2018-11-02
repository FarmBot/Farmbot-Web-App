jest.mock("../actions", () => ({
  openOrCloseGarden: jest.fn(),
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import * as React from "react";
import { shallow } from "enzyme";
import {
  fakeSavedGarden
} from "../../../__test_support__/fake_state/resources";
import { edit } from "../../../api/crud";
import { GardenInfo } from "../garden_list";

describe("<GardenInfo />", () => {
  const fakeProps = () => ({
    dispatch: jest.fn(),
    savedGarden: fakeSavedGarden(),
    gardenIsOpen: false,
    plantCount: 1,
  });

  it("edits garden name", () => {
    const wrapper = shallow(<GardenInfo {...fakeProps()} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "new name" } });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "new name" });
  });
});
