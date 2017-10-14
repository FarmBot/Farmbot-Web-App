import * as React from "react";
import { mount, shallow } from "enzyme";
import { BulkSchedulerWidget } from "../index";
import { BulkEditorProps } from "../interfaces";
import { buildResourceIndex } from "../../../__test_support__/resource_index_builder";
import { Actions } from "../../../constants";
import { fakeSequence } from "../../../__test_support__/fake_state/resources";

describe("<BulkSchedulerWidget />", () => {
  const weeks = [{
    days:
    {
      day1: true,
      day2: false,
      day3: false,
      day4: false,
      day5: false,
      day6: false,
      day7: false
    }
  }];

  function fakeProps(): BulkEditorProps {
    const sequence = fakeSequence();
    sequence.body.name = "Fake Sequence";
    return {
      selectedSequence: sequence,
      dailyOffsetMs: 3600000,
      weeks,
      sequences: [fakeSequence(), fakeSequence()],
      resources: buildResourceIndex([]).index,
      dispatch: jest.fn()
    };
  }

  it("renders with sequence selected", () => {
    const wrapper = mount(<BulkSchedulerWidget {...fakeProps() } />);
    const buttons = wrapper.find("button");
    expect(buttons.length).toEqual(6);
    expect(wrapper.text()).toContain("Scheduler");
    expect(wrapper.text())
      .toContain("SequenceFake SequenceTimeDaysWeek 11234567");
  });

  it("renders without sequence selected", () => {
    const p = fakeProps();
    p.selectedSequence = undefined;
    const wrapper = mount(<BulkSchedulerWidget {...p } />);
    expect(wrapper.text()).toContain("SequenceNoneTime");
  });

  it("changes time", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = shallow(<BulkSchedulerWidget {...p } />);
    const timeInput = wrapper.find("BlurableInput").first();
    expect(timeInput.props().value).toEqual("01:00");
    timeInput.simulate("commit", { currentTarget: { value: "02:00" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: 7200000,
      type: Actions.SET_TIME_OFFSET
    });
  });

  it("changes sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = shallow(<BulkSchedulerWidget {...p } />);
    const sequenceInput = wrapper.find("FBSelect").first();
    sequenceInput.simulate("change", { value: "sequences" });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: "sequences",
      type: Actions.SET_SEQUENCE
    });
  });

  it("doesn't change sequence", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const wrapper = shallow(<BulkSchedulerWidget {...p } />);
    const sequenceInput = wrapper.find("FBSelect").first();
    const change = () => sequenceInput.simulate("change", { value: 4 });
    expect(change).toThrowError("WARNING: Not a sequence UUID.");
    expect(p.dispatch).not.toHaveBeenCalled();
  });
});
