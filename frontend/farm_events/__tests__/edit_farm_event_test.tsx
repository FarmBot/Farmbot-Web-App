const mockSave = jest.fn();

import React from "react";
import { mount } from "enzyme";
import { RawEditFarmEvent as EditFarmEvent } from "../edit_farm_event";
import { AddEditFarmEventProps } from "../../farm_designer/interfaces";
import {
  fakeFarmEvent, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Path } from "../../internal_urls";
import * as crud from "../../api/crud";
import { success } from "../../toast/toast";
import { EditFEForm } from "../edit_fe_form";

let destroySpy: jest.SpyInstance;

describe("<EditFarmEvent />", () => {
  beforeEach(() => {
    mockSave.mockClear();
    destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function fakeProps(): AddEditFarmEventProps {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
    return {
      deviceTimezone: "",
      dispatch: jest.fn(() => Promise.resolve()),
      regimensById: {},
      sequencesById: { "1": sequence },
      farmEventsById: { "1": farmEvent },
      executableOptions: [],
      repeatOptions: [],
      handleTime: jest.fn(),
      farmEvents: [],
      getFarmEvent: _ => farmEvent,
      findFarmEventByUuid: () => farmEvent,
      findExecutable: () => sequence,
      timeSettings: fakeTimeSettings(),
      resources: buildResourceIndex([]).index,
    };
  }

  it("renders", () => {
    const wrapper = mount(<EditFarmEvent {...fakeProps()} />);
    ["Edit event", "Save"]
      .map(string => expect(wrapper.text()).toContain(string));
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.farmEvents("nope"));
    const p = fakeProps();
    const navigate = jest.fn();
    p.getFarmEvent = jest.fn(url => navigate(url));
    const wrapper = mount(<EditFarmEvent {...p} />);
    expect(wrapper.text()).toContain("Redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmEvents());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const p = fakeProps();
    p.getFarmEvent = jest.fn();
    const wrapper = mount(<EditFarmEvent {...p} />);
    expect(wrapper.text()).toContain("Redirecting");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("calls farm event save", () => {
    const wrapper = mount(<EditFarmEvent {...fakeProps()} />);
    const form = wrapper.find(EditFEForm).instance() as EditFEForm;
    form.commitViewModel = mockSave as unknown as EditFEForm["commitViewModel"];
    wrapper.find(".save-btn").simulate("click");
    expect(mockSave).toHaveBeenCalled();
  });

  it("doesn't call farm event save if event is missing", () => {
    const p = fakeProps();
    p.getFarmEvent = () => undefined as never;
    location.pathname = Path.mock(Path.farmEvents("nope"));
    const wrapper = mount(<EditFarmEvent {...p} />);
    wrapper.find(".save-btn").simulate("click");
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("deletes farm event", async () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
    p.getFarmEvent = () => farmEvent;
    const wrapper = mount(<EditFarmEvent {...p} />);
    await wrapper.find(".fa-trash").simulate("click");
    expect(destroySpy).toHaveBeenCalledWith(farmEvent.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmEvents());
    expect(success).toHaveBeenCalledWith("Deleted event.", { title: "Deleted" });
  });
});
