import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.farmEvents(1));
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
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
import { push } from "../../history";

describe("<EditFarmEvent />", () => {
  function fakeProps(): AddEditFarmEventProps {
    const sequence = fakeSequence();
    sequence.body.id = 1;
    const farmEvent = fakeFarmEvent("Sequence", sequence.body.id);
    return {
      deviceTimezone: "",
      dispatch: jest.fn(),
      regimensById: {},
      sequencesById: { "1": sequence },
      farmEventsById: { "1": farmEvent },
      executableOptions: [],
      repeatOptions: [],
      handleTime: jest.fn(),
      farmEvents: [],
      getFarmEvent: () => farmEvent,
      findFarmEventByUuid: () => farmEvent,
      findExecutable: () => sequence,
      timeSettings: fakeTimeSettings(),
      resources: buildResourceIndex([]).index,
    };
  }

  it("renders", () => {
    const wrapper = mount(<EditFarmEvent {...fakeProps()} />);
    ["Sequence or Regimen", "fake", "Save"]
      .map(string => expect(wrapper.text()).toContain(string));
    const deleteBtn = wrapper.find(".fa-trash").first();
    expect(deleteBtn.props().hidden).toBeFalsy();
  });

  it("redirects", () => {
    mockPath = Path.mock(Path.farmEvents("nope"));
    const p = fakeProps();
    p.getFarmEvent = jest.fn();
    const wrapper = mount(<EditFarmEvent {...p} />);
    expect(wrapper.text()).toContain("Redirecting");
    expect(push).toHaveBeenCalledWith(Path.farmEvents());
  });

  it("doesn't redirect", () => {
    mockPath = Path.mock(Path.logs());
    const p = fakeProps();
    p.getFarmEvent = jest.fn();
    const wrapper = mount(<EditFarmEvent {...p} />);
    expect(wrapper.text()).toContain("Redirecting");
    expect(push).not.toHaveBeenCalled();
  });
});
