jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../history", () => ({
  history: {
    push: jest.fn()
  }
}));

import * as React from "react";
import { mount } from "enzyme";
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
      formatDate: jest.fn(),
      formatTime: jest.fn(),
      handleTime: jest.fn(),
      farmEvents: [farmEvent],
      getFarmEvent: () => farmEvent,
      findExecutable: () => sequence
    };
  }

  it("renders", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps() } />);
    wrapper.setState({ uuid: "FarmEvent" });
    ["Add Farm Event", "Sequence or Regimen", "fake", "Save"].map(string =>
      expect(wrapper.text()).toContain(string));
    const deleteBtn = wrapper.find("button").last();
    expect(deleteBtn.text()).toEqual("Delete");
    expect(deleteBtn.props().hidden).toBeTruthy();
  });

  it("redirects", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps() } />);
    expect(wrapper.text()).toContain("Loading");
  });
});
