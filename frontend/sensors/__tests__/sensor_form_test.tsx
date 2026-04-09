import React from "react";
import { SensorForm } from "../sensor_form";
import { SensorFormProps } from "../interfaces";
import { fakeSensor } from "../../__test_support__/fake_state/resources";

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

  it("renders a list of editable sensors, in sorted order", () => {
    const form = SensorForm(fakeProps());
    const typedForm = form as React.ReactElement<{ children?: React.ReactNode }>;
    const rows = React.Children.toArray(typedForm.props.children) as
      React.ReactElement<{ children?: React.ReactNode }>[];
    const firstRow = rows[0] as React.ReactElement<{ children?: React.ReactNode }>;
    const secondRow = rows[1] as React.ReactElement<{ children?: React.ReactNode }>;
    const firstRowChildren = React.Children
      .toArray(firstRow?.props.children) as
      React.ReactElement<Record<string, unknown>>[];
    const secondRowChildren = React.Children
      .toArray(secondRow?.props.children) as
      React.ReactElement<Record<string, unknown>>[];
    expect(firstRowChildren[0]?.props.value).toEqual("GPIO 51");
    expect(secondRowChildren[0]?.props.value).toEqual("GPIO 50 - Moisture");
    expect(firstRowChildren[1]?.props.value).toEqual(51);
    expect(secondRowChildren[1]?.props.value).toEqual(50);
    expect(firstRowChildren[2]?.props.value).toEqual(0);
    expect(secondRowChildren[2]?.props.value).toEqual(0);
  });
});
