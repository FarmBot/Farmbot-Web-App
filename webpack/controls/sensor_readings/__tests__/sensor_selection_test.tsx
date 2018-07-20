import * as React from "react";
import { mount, shallow } from "enzyme";
import { SensorSelection, SensorSelectionProps } from "../sensor_selection";
import { fakeSensor } from "../../../__test_support__/fake_state/resources";

describe("<SensorSelection />", () => {
  function fakeProps(): SensorSelectionProps {
    return {
      selectedSensor: undefined,
      sensors: [],
      setSensor: jest.fn(),
    };
  }

  it("renders", () => {
    const wrapper = mount(<SensorSelection {...fakeProps()} />);
    const txt = wrapper.text().toLowerCase();
    ["sensor", "all"]
      .map(string => expect(txt).toContain(string));
  });

  it("renders selected sensor", () => {
    const s = fakeSensor();
    const p = fakeProps();
    p.selectedSensor = s;
    p.sensors = [s];
    const wrapper = mount(<SensorSelection {...p} />);
    expect(wrapper.text()).toContain(s.body.label);
  });

  it("selects sensor", () => {
    const s = fakeSensor();
    const p = fakeProps();
    p.sensors = [s];
    const wrapper = shallow(<SensorSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: s.uuid });
    expect(p.setSensor).toHaveBeenCalledWith(s);
  });
});
