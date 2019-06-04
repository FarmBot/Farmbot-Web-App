import * as React from "react";
import { mount, shallow } from "enzyme";
import { PeripheralForm } from "../peripheral_form";
import { TaggedPeripheral, SpecialStatus } from "farmbot";
import { PeripheralFormProps } from "../interfaces";
import { Actions } from "../../../constants";

describe("<PeripheralForm/>", () => {
  const dispatch = jest.fn();
  const peripherals: TaggedPeripheral[] = [
    {
      uuid: "Peripheral.2.2",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 2,
        pin: 13,
        label: "GPIO 13 - LED"
      }
    },
    {
      uuid: "Peripheral.1.1",
      specialStatus: SpecialStatus.SAVED,
      kind: "Peripheral",
      body: {
        id: 1,
        pin: 2,
        label: "GPIO 2"
      }
    },
  ];
  const fakeProps = (): PeripheralFormProps => ({ dispatch, peripherals });

  const expectedPayload = (update: Object) =>
    expect.objectContaining({
      payload: expect.objectContaining({
        update
      }),
      type: Actions.EDIT_RESOURCE
    });

  it("renders a list of editable peripherals, in sorted order", () => {
    const form = mount(<PeripheralForm dispatch={dispatch}
      peripherals={peripherals} />);
    const inputs = form.find("input");
    expect(inputs.at(0).props().value).toEqual("GPIO 2");
    expect(inputs.at(1).props().value).toEqual("GPIO 13 - LED");
  });

  it("updates label", () => {
    const p = fakeProps();
    const form = shallow(<PeripheralForm {...p} />);
    const inputs = form.find("input");
    inputs.at(0).simulate("change", { currentTarget: { value: "GPIO 3" } });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ label: "GPIO 3" }));
  });

  it("updates pin", () => {
    const p = fakeProps();
    const form = shallow(<PeripheralForm {...p} />);
    form.find("FBSelect").at(0).simulate("change", { value: 3 });
    expect(p.dispatch).toHaveBeenCalledWith(expectedPayload({ pin: 3 }));
  });

  it("deletes peripheral", () => {
    const p = fakeProps();
    const form = shallow(<PeripheralForm {...p} />);
    const buttons = form.find("button");
    buttons.at(0).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
