jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { mount } from "enzyme";
import { RawAddFarmEvent as AddFarmEvent } from "../add_farm_event";
import { AddEditFarmEventProps } from "../../interfaces";
import {
  fakeFarmEvent, fakeSequence, fakeRegimen
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";

describe("<AddFarmEvent />", () => {
  function fakeProps(): AddEditFarmEventProps {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
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
      findFarmEventByUuid: () => farmEvent,
      findExecutable: () => sequence,
      timeSettings: fakeTimeSettings(),
      autoSyncEnabled: false,
      shouldDisplay: () => false,
      resources: buildResourceIndex([]).index,
    };
  }

  it("renders", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps()} />);
    wrapper.setState({ uuid: "FarmEvent" });
    ["Add Event", "Sequence or Regimen", "fake", "Save"].map(string =>
      expect(wrapper.text()).toContain(string));
    const deleteBtn = wrapper.find("button").last();
    expect(deleteBtn.text()).toEqual("Delete");
    expect(deleteBtn.props().hidden).toBeTruthy();
  });

  it("redirects", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    const wrapper = mount(<AddFarmEvent {...p} />);
    expect(wrapper.text()).toContain("Loading");
  });

  it("renders with no executables", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const wrapper = mount(<AddFarmEvent {...p} />);
    expect(wrapper.text())
      .toContain("You haven't made any regimens or sequences yet.");
  });

  it("renders with no sequences", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const regimen = fakeRegimen();
    regimen.body.id = 1;
    p.regimensById = { "1": regimen };
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.mount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.INIT_RESOURCE,
      payload: expect.objectContaining({
        kind: "FarmEvent",
        body: expect.objectContaining({ executable_type: "Regimen" })
      })
    });
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
