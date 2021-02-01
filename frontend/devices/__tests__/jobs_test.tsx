import React from "react";
import { mount } from "enzyme";
import {
  RawJobsPanel as JobsPanel, JobsPanelProps, mapStateToProps,
} from "../jobs";
import { fakeState } from "../../__test_support__/fake_state";

describe("<JobsPanel />", () => {
  const fakeProps = (): JobsPanelProps => ({
    jobs: {
      job1: { status: "complete", unit: "percent", percent: 100 },
      job2: { status: "working", unit: "bytes", bytes: 50 },
      job3: undefined,
    },
  });

  it("displays jobs", () => {
    const wrapper = mount(<JobsPanel {...fakeProps()} />);
    [
      "job1", "100", "percent", "complete",
      "job2", "50", "bytes", "working",
    ].map(string => expect(wrapper.text()).toContain(string));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.jobs).toEqual(state.bot.hardware.jobs);
  });
});
