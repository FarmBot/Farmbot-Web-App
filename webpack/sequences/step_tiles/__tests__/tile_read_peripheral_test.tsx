import * as React from "react";
import { shallow } from "enzyme";
import { fakeSequence, fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { ReadPeripheral, SequenceBodyItem, ReadPin, Nothing } from "farmbot/dist";
import { TileReadPeripheral } from "../tile_read_peripheral";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { StepCheckBox, PeripheralSelector } from "../pin_and_peripheral_support";

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
    component.find(StepCheckBox).last().simulate("click");
    expect(dispatch).toHaveBeenCalled();
    const action = expect
      .objectContaining({ "type": Actions.OVERWRITE_RESOURCE });
    expect(dispatch).toHaveBeenCalledWith(action);
  });

  it("crashes if not passed `read_peripheral", () => {
    const wrongStep: Nothing = { kind: "nothing", args: {} };
    expect(() => { bootstrapTest(wrongStep as any); }).toThrowError();
  });
});
