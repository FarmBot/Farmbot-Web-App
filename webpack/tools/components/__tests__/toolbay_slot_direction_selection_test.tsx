import * as React from "react";
import { shallow } from "enzyme";
import {
  SlotDirectionSelect, SlotDirectionSelectProps
} from "../toolbay_slot_direction_selection";
import { fakeToolSlot } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { SpecialStatus } from "../../../resources/tagged_resources";

describe("<SlotDirectionSelect />", () => {
  const fakeProps = (): SlotDirectionSelectProps => {
    return {
      dispatch: jest.fn(),
      slot: fakeToolSlot()
    };
  };

  it("changes slot direction", () => {
    const p = fakeProps();
    const wrapper = shallow(<SlotDirectionSelect {...p} />);
    wrapper.simulate("change", { value: 1 });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { pullout_direction: 1 },
        uuid: expect.any(String)
      },
      type: Actions.EDIT_RESOURCE
    });
  });
});
