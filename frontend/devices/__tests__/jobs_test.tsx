import React from "react";
import { mount } from "enzyme";
import {
  RawJobsPanel as JobsPanel, JobsPanelProps, mapStateToProps,
} from "../jobs";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeBytesJob, fakePercentJob } from "../../__test_support__/fake_bot_data";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<JobsPanel />", () => {
  const fakeProps = (): JobsPanelProps => ({
    jobs: {
      job1: fakePercentJob({ status: "complete", percent: 100 }),
      job2: fakeBytesJob({ bytes: 50, time: undefined }),
      job3: undefined,
    },
    timeSettings: fakeTimeSettings(),
  });

  it("displays jobs", () => {
    const wrapper = mount(<JobsPanel {...fakeProps()} />);
    [
      "job count: 3",
      "job name", "type", "file type", "progress", "unit", "status", "time",
      "job1", "100", "percent", "complete", "ota", ".fw", "pm",
      "job2", "50", "bytes", "working",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.jobs).toEqual(state.bot.hardware.jobs);
  });
});
