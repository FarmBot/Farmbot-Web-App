import * as React from "react";
import { shallow } from "enzyme";
import { fakeSequence, fakePeripheral } from "../../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { ReadPeripheral } from "farmbot";
import { Actions } from "../../../constants";
import { PeripheralSelector } from "../pin_and_peripheral_support";
import { FBSelect } from "../../../ui/index";

describe("PeripheralSelector", () => {
  const dispatch = jest.fn();
  const p = fakePeripheral();

  const step: ReadPeripheral = {
    kind: "read_peripheral",
    args: { peripheral_id: 0, pin_mode: 0 }
  };

  const el = shallow(<PeripheralSelector
    currentSequence={fakeSequence()}
    currentStep={step}
    dispatch={dispatch}
    index={0}
    resources={buildResourceIndex([p]).index} />);

  it("selects a peripheral", () => {
    const select = el.find(FBSelect).first();
    select.simulate("change", { value: p.body.id });
    expect(dispatch).toHaveBeenCalled();
    const action = expect.objectContaining({ "type": Actions.OVERWRITE_RESOURCE });
    expect(dispatch).toHaveBeenCalledWith(action);
    const kaboom = () => select.simulate("change", { value: "NO" });
    expect(kaboom).toThrowError();
  });
});
