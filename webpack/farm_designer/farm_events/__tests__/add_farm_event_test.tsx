jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({
  history: {
    push: jest.fn()
  }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { AddFarmEvent } from "../add_farm_event";
import { AddEditFarmEventProps } from "../../interfaces";
import { fakeFarmEvent, fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<AddFarmEvent />", () => {
  function fakeProps(): AddEditFarmEventProps {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.uuid = "FarmEvent";
    return {
      deviceTimezone: "",
      dispatch: jest.fn(),
      regimensById: {},
      sequencesById: { "1": sequence },
      farmEventsById: { "1": farmEvent },
      executableOptions: [],
      repeatOptions: [],
      handleTime: jest.fn(),
      farmEvents: [farmEvent],
      getFarmEvent: () => farmEvent,
      findExecutable: () => sequence,
      timeOffset: 0,
      autoSyncEnabled: false,
      allowRegimenBackscheduling: false,
    };
  }

  it("renders", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps()} />);
    wrapper.setState({ uuid: "FarmEvent" });
    ["Add Farm Event", "Sequence or Regimen", "fake", "Save"].map(string =>
      expect(wrapper.text()).toContain(string));
    const deleteBtn = wrapper.find("button").last();
    expect(deleteBtn.text()).toEqual("Delete");
    expect(deleteBtn.props().hidden).toBeTruthy();
  });

  it("redirects", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps()} />);
    expect(wrapper.text()).toContain("Loading");
  });

  it("renders `none`", () => {
    const props: Partial<AddEditFarmEventProps> = {};
    const comp = new AddFarmEvent(props as AddEditFarmEventProps);
    const results = shallow(<div>{comp.none()}</div>);
    expect(results.text())
      .toContain("You haven't made any regimens or sequences yet.");
  });

  it("cleans up when unmounting", () => {
    const props = fakeProps();
    const wrapper = mount(<AddFarmEvent {...props} />);
    wrapper.update();
    const uuid: string = wrapper.state("uuid");
    props.farmEvents[0].uuid = uuid;
    props.farmEvents[0].body.id = undefined;
    wrapper.setProps(props);
    wrapper.update();
    jest.resetAllMocks();
    wrapper.unmount();
    expect(props.dispatch).toHaveBeenCalled();
    expect(props.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
