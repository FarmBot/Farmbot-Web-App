jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
  init: jest.fn(() => ({ payload: { uuid: "fakeUuid" } })),
}));

jest.mock("../edit_fe_form", () => ({
  EditFEForm: () => <div>EditFEForm</div>,
  FarmEventForm: () => <div />,
  FarmEventViewModel: {},
  NEVER: "never",
}));

const mockSave = jest.fn();
interface MockRefCurrent {
  commitViewModel(): void;
}
interface MockRef {
  current: MockRefCurrent | undefined;
}
const mockRef: MockRef = { current: { commitViewModel: mockSave } };
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  createRef: () => mockRef,
}));

jest.mock("../../resources/actions", () => ({ destroyOK: jest.fn() }));

import React from "react";
import { mount, shallow } from "enzyme";
import { RawAddFarmEvent as AddFarmEvent } from "../add_farm_event";
import {
  AddEditFarmEventProps, TaggedExecutable,
} from "../../farm_designer/interfaces";
import {
  fakeFarmEvent, fakeSequence, fakeRegimen,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { destroyOK } from "../../resources/actions";
import { init, destroy } from "../../api/crud";
import { DesignerPanelHeader } from "../../farm_designer/designer_panel";
import { Content } from "../../constants";
import { error } from "../../toast/toast";
import { SaveBtn } from "../../ui";

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
      getFarmEvent: _ => farmEvent,
      findFarmEventByUuid: () => farmEvent,
      findExecutable: () => sequence,
      timeSettings: fakeTimeSettings(),
      resources: buildResourceIndex([]).index,
    };
  }

  it("renders", () => {
    const wrapper = mount(<AddFarmEvent {...fakeProps()} />);
    wrapper.setState({ uuid: "FarmEvent" });
    ["Add Event", "Save"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
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

  it("inits FarmEvent", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const regimen = fakeRegimen();
    regimen.body.id = 1;
    p.regimensById = { "1": regimen };
    p.findFarmEventByUuid = jest.fn();
    p.findExecutable = () => regimen;
    const wrapper = mount<AddFarmEvent>(<AddFarmEvent {...p} />);
    wrapper.instance().initFarmEvent({
      label: "", value: "1", headingId: "Regimen",
    });
    expect(init).toHaveBeenCalledWith("FarmEvent",
      expect.objectContaining({ executable_type: "Regimen" }));
  });

  it("inits FarmEvent: sequence", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const sequence = fakeSequence();
    sequence.body.id = 0;
    p.sequencesById = { "1": sequence };
    p.findFarmEventByUuid = jest.fn();
    p.findExecutable = () => sequence;
    const wrapper = mount<AddFarmEvent>(<AddFarmEvent {...p} />);
    wrapper.instance().initFarmEvent({
      label: "", value: "1", headingId: "Sequence",
    });
    expect(init).toHaveBeenCalledWith("FarmEvent",
      expect.objectContaining({ executable_type: "Sequence" }));
  });

  it("doesn't init FarmEvent: missing executable", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const sequence = fakeSequence();
    sequence.body.id = 1;
    p.sequencesById = { "1": sequence };
    p.findFarmEventByUuid = jest.fn();
    p.findExecutable = () => undefined as unknown as TaggedExecutable;
    const wrapper = mount<AddFarmEvent>(<AddFarmEvent {...p} />);
    wrapper.instance().initFarmEvent({
      label: "", value: "1", headingId: "Sequence",
    });
    expect(init).not.toHaveBeenCalled();
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
    wrapper.find(SaveBtn).simulate("click");
    expect(mockSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.MISSING_EXECUTABLE);
  });

  it("shows error on save: no selection", () => {
    const p = fakeProps();
    p.executableOptions = [{ label: "", value: "1" }];
    p.findFarmEventByUuid = jest.fn();
    const wrapper = shallow(<AddFarmEvent {...p} />);
    wrapper.find(SaveBtn).simulate("click");
    expect(mockSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Please select a sequence or regimen.");
  });

  it("saves", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.find(".save-btn").simulate("click");
    expect(mockSave).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("handles missing ref", () => {
    mockRef.current = undefined;
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    p.findFarmEventByUuid = () => farmEvent;
    const wrapper = mount(<AddFarmEvent {...p} />);
    wrapper.find(".save-btn").simulate("click");
    expect(mockSave).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });
});
