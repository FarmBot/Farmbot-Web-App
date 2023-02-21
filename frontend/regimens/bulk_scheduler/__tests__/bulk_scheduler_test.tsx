import React from "react";
import { mount, shallow } from "enzyme";
import { BulkScheduler, nearOsUpdateTime } from "../bulk_scheduler";
import { BulkEditorProps } from "../interfaces";
import {
  buildResourceIndex, fakeDevice,
} from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";
import { newWeek } from "../../reducer";

describe("<BulkScheduler />", () => {
  const week = newWeek();
  week.days.day1 = true;
  const weeks = [week];

  function fakeProps(): BulkEditorProps {
    const sequence = fakeSequence();
    sequence.body.name = "Fake Sequence";
    const sequenceWithoutId = fakeSequence();
    sequenceWithoutId.body.id = undefined;
    return {
      selectedSequence: sequence,
      dailyOffsetMs: 3600000,
      weeks,
      sequences: [fakeSequence(), fakeSequence(), sequenceWithoutId],
      resources: buildResourceIndex([]).index,
      dispatch: jest.fn(),
      device: fakeDevice(),
    };
  }

  it("renders with sequence selected", () => {
    const wrapper = mount(<BulkScheduler {...fakeProps()} />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toEqual(5);
    ["Sequence", "Fake Sequence", "Time",
      "Days", "Week 1", "1234567"]
      .map(string =>
        expect(wrapper.text()).toContain(string));
  });

  it("renders without sequence selected", () => {
    const p = fakeProps();
    p.selectedSequence = undefined;
    const wrapper = mount(<BulkScheduler {...p} />);
    ["Sequence", "None", "Time"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("changes time", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().TimeSelection());
    const timeInput = wrapper.find("BlurableInput").first();
    expect(timeInput.props().value).toEqual("01:00");
    timeInput.simulate("commit", { currentTarget: { value: "02:00" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 7200000,
      type: Actions.SET_TIME_OFFSET
    });
  });

  it("sets current time", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().TimeSelection());
    const currentTimeBtn = wrapper.find(".fa-clock-o").first();
    currentTimeBtn.simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: expect.any(Number),
      type: Actions.SET_TIME_OFFSET
    });
  });

  it("changes sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().SequenceSelectBox());
    const sequenceInput = wrapper.find("FBSelect").first();
    sequenceInput.simulate("change", { value: "Sequence" });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: "Sequence",
      type: Actions.SET_SEQUENCE
    });
  });

  it("doesn't change sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().SequenceSelectBox());
    const sequenceInput = wrapper.find("FBSelect").first();
    const change = () => sequenceInput.simulate("change", { value: 4 });
    expect(change).toThrow("WARNING: Not a sequence UUID.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("shows warning", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.device.body.ota_hour = 3;
    p.dailyOffsetMs = 10800000;
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().TimeSelection());
    const timeInput = wrapper.find("BlurableInput").first();
    timeInput.simulate("commit", { currentTarget: { value: "03:00" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 10800000,
      type: Actions.SET_TIME_OFFSET
    });
    expect(wrapper.html()).toContain(" input-error");
  });

  it("doesn't show warning", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    p.device.body.ota_hour = undefined;
    p.dailyOffsetMs = 10800000;
    const panel = shallow<BulkScheduler>(<BulkScheduler {...p} />);
    const wrapper = shallow(panel.instance().TimeSelection());
    const timeInput = wrapper.find("BlurableInput").first();
    timeInput.simulate("commit", { currentTarget: { value: "03:00" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 10800000,
      type: Actions.SET_TIME_OFFSET
    });
    expect(wrapper.html()).not.toContain(" input-error");
  });
});

describe("nearOsUpdateTime()", () => {
  it("returns result", () => {
    expect(nearOsUpdateTime(0, 0)).toBeTruthy();
    expect(nearOsUpdateTime(23.5 * 60 * 60 * 1000, 0)).toBeTruthy();
    expect(nearOsUpdateTime(0, undefined)).toBeFalsy();
    expect(nearOsUpdateTime(2.5 * 60 * 60 * 1000, 3)).toBeTruthy();
  });
});
