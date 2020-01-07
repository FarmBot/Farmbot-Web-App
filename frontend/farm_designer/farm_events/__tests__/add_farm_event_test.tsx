jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

jest.mock("../../../api/crud", () => ({
  destroy: jest.fn(),
  init: jest.fn(() => ({ payload: { uuid: "fakeUuid" } })),
}));

jest.mock("../../../resources/actions", () => ({ destroyOK: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { RawAddFarmEvent as AddFarmEvent } from "../add_farm_event";
import { AddEditFarmEventProps } from "../../interfaces";
import {
  fakeFarmEvent, fakeSequence, fakeRegimen
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { destroyOK } from "../../../resources/actions";
import { init, destroy } from "../../../api/crud";
import { DesignerPanelHeader } from "../../designer_panel";
import { Content } from "../../../constants";
import { error } from "../../../toast/toast";
import { FarmEventForm } from "../edit_fe_form";

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

  it("renders with no executables", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const wrapper = mount(<AddFarmEvent {...p} />);
    expect(wrapper.html()).toContain("fa-exclamation-triangle");
  });

  it("changes temporary values", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const wrapper = mount<AddFarmEvent>(<AddFarmEvent {...p} />);
    expect(wrapper.instance().getField("repeat")).toEqual("1");
    wrapper.instance().setField("repeat", "2");
    expect(wrapper.state().temporaryValues.repeat).toEqual("2");
  });

  it("renders with no sequences", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const regimen = fakeRegimen();
    regimen.body.id = 1;
    p.regimensById = { "1": regimen };
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.mount();
    expect(init).toHaveBeenCalledWith("FarmEvent",
      expect.objectContaining({ executable_type: "Regimen" }));
  });

  it("cleans up when unmounting", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 0;
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.unmount();
    expect(destroy).toHaveBeenCalledWith(farmEvent.uuid, true);
  });

  it("doesn't delete saved farm events when unmounting", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 1;
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.unmount();
    expect(destroy).not.toHaveBeenCalled();
  });

  it("cleans up on back", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 0;
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = shallow(<AddFarmEvent {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(destroyOK).toHaveBeenCalledWith(farmEvent);
  });

  it("doesn't delete saved farm events on back", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 1;
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = shallow(<AddFarmEvent {...p} />);
    wrapper.find(DesignerPanelHeader).simulate("back");
    expect(destroyOK).not.toHaveBeenCalled();
  });

  it("shows error on save", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const wrapper = shallow(<AddFarmEvent {...p} />);
    wrapper.find(FarmEventForm).simulate("save");
    expect(error).toHaveBeenCalledWith(Content.MISSING_EXECUTABLE);
  });
});
