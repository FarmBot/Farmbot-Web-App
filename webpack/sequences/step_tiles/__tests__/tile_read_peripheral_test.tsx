import * as React from "react";
import { shallow } from "enzyme";
import { fakeSequence, fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { ReadPeripheral, SequenceBodyItem, ReadPin } from "farmbot/dist";
import { TileReadPeripheral } from "../tile_read_peripheral";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { FBSelect } from "../../../ui/index";

const p = fakePeripheral();
const exampleStep: ReadPeripheral = {
  kind: "read_peripheral",
  args: { pin_mode: 0, peripheral_id: 1 }
};

describe("<TileReadPeripheral/>", () => {
  function bootstrapTest(step: SequenceBodyItem = exampleStep, isShallow = false) {
    const dispatch = jest.fn();
    return {
      dispatch,
      peripheral: p,
      component: shallow(<TileReadPeripheral
        currentSequence={fakeSequence()}
        currentStep={step}
        dispatch={dispatch}
        index={0}
        resources={buildResourceIndex([p]).index} />)
    };
  }

  it("toggles to `read_pin`", () => {
    const { component, dispatch } = bootstrapTest();
    component.find("input").last().simulate("change");
    expect(dispatch).toHaveBeenCalled();
    const action = expect
      .objectContaining({ "type": Actions.OVERWRITE_RESOURCE });
    expect(dispatch).toHaveBeenCalledWith(action);
  });

  it("selects a peripheral", () => {
    jest.clearAllMocks();
    const { component, dispatch, peripheral } = bootstrapTest();
    component
      .find(FBSelect)
      .simulate("change", { value: peripheral.body.id });
    expect(dispatch).toHaveBeenCalled();
    const action = expect.objectContaining({ "type": Actions.OVERWRITE_RESOURCE });
    expect(dispatch).toHaveBeenCalledWith(action);
    const kaboom =
      () => component.find(FBSelect).simulate("change", { value: "NO" });
    expect(kaboom).toThrowError();
  });

  it("crashes if not passed `read_peripheral", () => {
    const wrongStep: ReadPin = {
      kind: "read_pin",
      args: {
        label: "x",
        pin_number: 12,
        pin_mode: 0,
      }
    };
    expect(() => { bootstrapTest(wrongStep); }).toThrowError();
  });
});
