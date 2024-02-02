import React from "react";
import { mount } from "enzyme";
import {
  RawJobsPanel as JobsPanel, JobsPanelProps, mapStateToProps, JobsTable,
  JobsTableProps, jobNameLookup, addTitleToJobProgress,
  JobsAndLogs, JobsAndLogsProps,
} from "../jobs";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeBytesJob, fakePercentJob } from "../../__test_support__/fake_bot_data";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { bot } from "../../__test_support__/fake_state/bot";
import { jobsState } from "../../__test_support__/panel_state";
import { Actions } from "../../constants";
import { fakeDevice } from "../../__test_support__/resource_index_builder";

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
      "job", "type", "ext", "progress", "status", "time",
      "job1", "100%", "complete", "ota", ".fw", "pm",
      "job2", "50", "working",
      "job3", "99%", "working",
    ].map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });
});

describe("<JobsAndLogs />", () => {
  const fakeProps = (): JobsAndLogsProps => ({
    dispatch: jest.fn(),
    logs: [],
    timeSettings: fakeTimeSettings(),
    sourceFbosConfig: jest.fn(),
    getConfigValue: jest.fn(),
    bot,
    fbosVersion: undefined,
    jobsPanelState: jobsState(),
    jobs: {},
    device: fakeDevice(),
  });

  it("renders jobs", () => {
    const p = fakeProps();
    p.jobsPanelState.jobs = true;
    p.jobsPanelState.logs = false;
    const wrapper = mount(<JobsAndLogs {...p} />);
    expect(wrapper.html()).toContain("jobs-tab");
    expect(wrapper.html()).not.toContain("logs-tab");
  });

  it("renders logs", () => {
    const p = fakeProps();
    p.jobsPanelState.jobs = false;
    p.jobsPanelState.logs = true;
    const wrapper = mount(<JobsAndLogs {...p} />);
    expect(wrapper.html()).not.toContain("jobs-tab");
    expect(wrapper.html()).toContain("logs-tab");
  });

  it("sets state", () => {
    const p = fakeProps();
    const wrapper = mount<JobsAndLogs>(<JobsAndLogs {...p} />);
    wrapper.instance().setPanelState("logs")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_JOBS_PANEL_OPTION, payload: "logs",
    });
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
