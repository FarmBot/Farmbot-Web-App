import React from "react";
import { mount } from "enzyme";
import {
  RawJobsPanel as JobsPanel, JobsPanelProps, mapStateToProps, JobsTable,
  JobsTableProps, jobNameLookup, addTitleToJobProgress,
} from "../jobs";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeBytesJob, fakePercentJob } from "../../__test_support__/fake_bot_data";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("<JobsPanel />", () => {
  const fakeProps = (): JobsPanelProps => ({
    jobs: {
      job1: fakePercentJob({ status: "complete", percent: 100 }),
      job2: fakeBytesJob({ bytes: 50, time: undefined }),
      job3: fakePercentJob(),
      job4: undefined,
    },
    timeSettings: fakeTimeSettings(),
  });

  it("displays jobs", () => {
    const wrapper = mount(<JobsPanel {...fakeProps()} />);
    [
      "job count: 4",
      "job", "type", "ext", "progress", "status", "time", "duration",
      "job1", "100%", "complete", "ota", ".fw", "pm",
      "job2", "50", "working",
      "job3", "99%", "working",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("<JobsTable />", () => {
  const fakeProps = (): JobsTableProps => ({
    jobs: { job: fakePercentJob() },
    timeSettings: fakeTimeSettings(),
  });

  it("displays jobs table", () => {
    const wrapper = mount(<JobsTable {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("job");
  });
});

describe("jobNameLookup()", () => {
  it("returns job name", () => {
    const jobWithTitle = addTitleToJobProgress(["job name", fakePercentJob()]);
    expect(jobNameLookup(jobWithTitle)).toEqual("job name");
  });

  it("returns nothing", () => {
    expect(jobNameLookup(undefined)).toEqual("");
  });

  it("returns photo upload", () => {
    const jobWithTitle = addTitleToJobProgress(
      ["/job", fakePercentJob({ type: "image" })]);
    expect(jobNameLookup(jobWithTitle)).toEqual("Photo upload");
  });

  it("returns OS update", () => {
    const jobWithTitle = addTitleToJobProgress(
      ["FBOS_OTA", fakePercentJob({ type: "ota" })]);
    expect(jobNameLookup(jobWithTitle)).toEqual("FarmBot OS update");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.jobs).toEqual(state.bot.hardware.jobs);
  });
});
