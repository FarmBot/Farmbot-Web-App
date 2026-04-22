const mockSave = jest.fn();

import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
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
import * as resourcesActions from "../../resources/actions";
import * as crud from "../../api/crud";
import { Content } from "../../constants";
import { error } from "../../toast/toast";
import { EditFEForm } from "../edit_fe_form";

let initSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let destroyOKSpy: jest.SpyInstance;

describe("<AddFarmEvent />", () => {
  beforeEach(() => {
    mockSave.mockClear();
    initSpy = jest.spyOn(crud, "init")
      .mockImplementation(() => ({ payload: { uuid: "fakeUuid" } } as never));
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
    destroyOKSpy = jest.spyOn(resourcesActions, "destroyOK")
      .mockImplementation(jest.fn());
  });

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
    const ref = React.createRef<AddFarmEvent>();
    const { container } = render(<AddFarmEvent ref={ref} {...fakeProps()} />);
    act(() => {
      ref.current?.setState({ uuid: "FarmEvent" });
    });
    ["Add Event", "Save"].map(string =>
      expect((container.textContent || "").toLowerCase())
        .toContain(string.toLowerCase()));
  });

  it("changes temporary values", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const ref = React.createRef<AddFarmEvent>();
    render(<AddFarmEvent ref={ref} {...p} />);
    expect(ref.current?.getField("repeat")).toEqual("1");
    act(() => {
      ref.current?.setField("repeat", "2");
    });
    expect(ref.current?.state.temporaryValues.repeat).toEqual("2");
  });

  it("inits FarmEvent", () => {
    const p = fakeProps();
    p.sequencesById = {};
    const regimen = fakeRegimen();
    regimen.body.id = 1;
    p.regimensById = { "1": regimen };
    p.findFarmEventByUuid = jest.fn();
    p.findExecutable = () => regimen;
    const ref = React.createRef<AddFarmEvent>();
    render(<AddFarmEvent ref={ref} {...p} />);
    ref.current?.initFarmEvent({
      label: "", value: "1", headingId: "Regimen",
    });
    expect(initSpy).toHaveBeenCalledWith("FarmEvent",
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
    const ref = React.createRef<AddFarmEvent>();
    render(<AddFarmEvent ref={ref} {...p} />);
    ref.current?.initFarmEvent({
      label: "", value: "1", headingId: "Sequence",
    });
    expect(initSpy).toHaveBeenCalledWith("FarmEvent",
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
    const ref = React.createRef<AddFarmEvent>();
    render(<AddFarmEvent ref={ref} {...p} />);
    ref.current?.initFarmEvent({
      label: "", value: "1", headingId: "Sequence",
    });
    expect(initSpy).not.toHaveBeenCalled();
  });

  it("cleans up when unmounting", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 0;
    p.findFarmEventByUuid = () => farmEvent;
    const { unmount } = render(<AddFarmEvent {...p} />);
    unmount();
    expect(destroySpy).toHaveBeenCalledWith(farmEvent.uuid, true);
  });

  it("doesn't delete saved farm events when unmounting", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 1;
    p.findFarmEventByUuid = () => farmEvent;
    const { unmount } = render(<AddFarmEvent {...p} />);
    unmount();
    expect(destroySpy).not.toHaveBeenCalled();
  });

  it("cleans up on back", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 0;
    p.findFarmEventByUuid = () => farmEvent;
    const { container } = render(<AddFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(destroyOKSpy).toHaveBeenCalledWith(farmEvent);
  });

  it("doesn't delete saved farm events on back", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    farmEvent.body.id = 1;
    p.findFarmEventByUuid = () => farmEvent;
    const { container } = render(<AddFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".back-arrow") as Element);
    expect(destroyOKSpy).not.toHaveBeenCalled();
  });

  it("shows error on save", () => {
    const p = fakeProps();
    p.findFarmEventByUuid = jest.fn();
    p.sequencesById = {};
    p.regimensById = {};
    const { container } = render(<AddFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(mockSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(Content.MISSING_EXECUTABLE);
  });

  it("shows error on save: no selection", () => {
    const p = fakeProps();
    p.executableOptions = [{ label: "", value: "1" }];
    p.findFarmEventByUuid = jest.fn();
    const { container } = render(<AddFarmEvent {...p} />);
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(mockSave).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Please select a sequence or regimen.");
  });

  it("saves", () => {
    const p = fakeProps();
    const farmEvent = fakeFarmEvent("Sequence", 1);
    p.findFarmEventByUuid = () => farmEvent;
    const formRef = { current: undefined as unknown as EditFEForm };
    const createRefSpy = jest.spyOn(React, "createRef")
      .mockReturnValue(formRef);
    const { container } = render(<AddFarmEvent {...p} />);
    formRef.current.commitViewModel = mockSave;
    fireEvent.click(container.querySelector(".save-btn") as Element);
    expect(mockSave).toHaveBeenCalled();
    createRefSpy.mockRestore();
    expect(error).not.toHaveBeenCalled();
  });

});
