import * as React from "react";
import { mount } from "enzyme";
import { SlotMenu, SlotMenuProps } from "../toolbay_slot_menu";
import { fakeToolSlot } from "../../../__test_support__/fake_state/resources";
import { Actions } from "../../../constants";
import { SpecialStatus } from "farmbot";

describe("<SlotMenu />", () => {
  const fakeProps = (): SlotMenuProps => {
    return {
      dispatch: jest.fn(),
      slot: fakeToolSlot(),
      botPosition: { x: 1, y: 2, z: 3 }
    };
  };

  it("changes slot direction", () => {
    const p = fakeProps();
    const wrapper = mount(<SlotMenu {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { pullout_direction: 1 },
        uuid: expect.any(String)
      },
      type: Actions.EDIT_RESOURCE
    });
  });

  it("changes slot direction: reset", () => {
    const p = fakeProps();
    p.slot.body.pullout_direction = 4;
    const wrapper = mount(<SlotMenu {...p} />);
    wrapper.find("i").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: {
        specialStatus: SpecialStatus.DIRTY,
        update: { pullout_direction: 0 },
        uuid: expect.any(String)
      },
      type: Actions.EDIT_RESOURCE
    });
  });

  const checkDirection = (direction: number, expected: string) => {
    it("icon shows direction", () => {
      const p = fakeProps();
      p.slot.body.pullout_direction = direction;
      const wrapper = mount(<SlotMenu {...p} />);
      expect(wrapper.html()).toContain(expected);
    });
  };
  checkDirection(1, "right");
  checkDirection(2, "left");
  checkDirection(3, "up");
  checkDirection(4, "down");

  it("fills inputs with bot position", () => {
    const p = fakeProps();
    const wrapper = mount(<SlotMenu {...p} />);
    const buttons = wrapper.find("button");
    buttons.last().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.EDIT_RESOURCE,
      payload: expect.objectContaining({
        update: { x: 1, y: 2, z: 3 }
      })
    });
  });

  it("doesn't fills inputs with bot position unknown", () => {
    const p = fakeProps();
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount(<SlotMenu {...p} />);
    const buttons = wrapper.find("button");
    buttons.last().simulate("click");
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});
