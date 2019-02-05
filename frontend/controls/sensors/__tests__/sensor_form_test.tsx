import * as React from "react";
import { shallow } from "enzyme";
import { SensorForm } from "../sensor_form";
import { Actions } from "../../../constants";
import { SensorFormProps } from "../interfaces";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";

describe("<SensorForm/>", function () {
  const fakeProps = (): SensorFormProps => {
    const fakeSensor1 = fakeSensor();
    const fakeSensor2 = fakeSensor();
    fakeSensor1.body.id = 1;
    fakeSensor1.body.pin = 51;
    fakeSensor1.body.label = "GPIO 51";
    fakeSensor2.body.id = 2;
    fakeSensor2.body.pin = 50;
    fakeSensor2.body.label = "GPIO 50 - Moisture";
    return {
      dispatch: jest.fn(),
      sensors: [fakeSensor2, fakeSensor1]
    };
  };

  const expectedPayload = (update: Object) =>
    expect.objectContaining({
      payload: expect.objectContaining({
        update
      }),
      type: Actions.EDIT_RESOURCE
    });

  it("renders a list of editable sensors, in sorted order", () => {
    const form = shallow(<SensorForm {...fakeProps()} />);
    const inputs = form.find("input");
    expect(inputs.at(0).props().value).toEqual("GPIO 51");
    expect(inputs.at(1).props().value).toEqual("GPIO 50 - Moisture");
  });

  it("updates label", () => {
    const p = fakeProps();
    const form = shallow(<SensorForm {...p} />);
    const inputs = form.find("input");
    inputs.at(0).simulate("change", { currentTarget: { value: "GPIO 52" } });
    expect(p.dispatch).toHaveBeenCalledWith(
      expectedPayload({ label: "GPIO 52" }));
  });

  it("updates pin", () => {
    const p = fakeProps();
    const form = shallow(<SensorForm {...p} />);
    form.find("FBSelect").at(0).simulate("change", { value: 52 });
    expect(p.dispatch).toHaveBeenCalledWith(expectedPayload({ pin: 52 }));
  });

  it("updates mode", () => {
    const p = fakeProps();
    const form = shallow(<SensorForm {...p} />);
    form.find("FBSelect").at(1).simulate("change", { value: 0 });
    expect(p.dispatch).toHaveBeenCalledWith(expectedPayload({ mode: 0 }));
  });

  it("deletes sensor", () => {
    const p = fakeProps();
    const form = shallow(<SensorForm {...p} />);
    const buttons = form.find("button");
    buttons.at(0).simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
