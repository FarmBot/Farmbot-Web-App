jest.mock("../../api/crud", () => ({
  destroy: jest.fn(),
}));

jest.mock("../edit_fe_form", () => ({
  EditFEForm: () => <div>EditFEForm</div>,
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
import { destroy } from "../../api/crud";
import { success } from "../../toast/toast";

describe("<EditFarmEvent />", () => {
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
    wrapper.find(".save-btn").simulate("click");
    expect(mockSave).toHaveBeenCalled();
  });

  it("handles missing ref", () => {
    mockRef.current = undefined;
    const wrapper = mount(<EditFarmEvent {...fakeProps()} />);
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
    expect(destroy).toHaveBeenCalledWith(farmEvent.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.farmEvents());
    expect(success).toHaveBeenCalledWith("Deleted event.", { title: "Deleted" });
  });
});
