jest.mock("../actions", () => ({ openSavedGarden: jest.fn() }));

import * as React from "react";
import { shallow } from "enzyme";
import { GardenInfo } from "../garden_list";
import { fakeSavedGarden } from "../../../__test_support__/fake_state/resources";
import { SavedGardenInfoProps } from "../interfaces";
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
    expect(openSavedGarden).toHaveBeenCalledWith(p.savedGarden.uuid);
  });
});
