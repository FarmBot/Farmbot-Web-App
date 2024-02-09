import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { Everything, JobsAndLogsState, TimeSettings } from "../interfaces";
import {
  BytesProgress, Dictionary, JobProgress, PercentageProgress, TaggedDevice,
  TaggedLog,
} from "farmbot";
import { t } from "../i18next_wrapper";
import { maybeGetTimeSettings } from "../resources/selectors";
import moment from "moment";
import { betterCompact, formatTime } from "../util";
import { Color } from "../ui";
import { cloneDeep, round, sortBy } from "lodash";
import { Actions } from "../constants";
import { BotState, SourceFbosConfig } from "./interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { LogsPanel } from "../logs";

export interface JobsPanelProps {
  jobs: Dictionary<JobProgress | undefined>;
  timeSettings: TimeSettings;
}

export const mapStateToProps = (props: Everything): JobsPanelProps => ({
  jobs: props.bot.hardware.jobs,
  timeSettings: maybeGetTimeSettings(props.resources.index),
});

export class RawJobsPanel extends React.Component<JobsPanelProps, {}> {
  render() {
    return <DesignerPanel panelName={"jobs"} panel={Panel.Logs}>
      <DesignerNavTabs />
      <DesignerPanelTop panel={Panel.Logs} />
      <DesignerPanelContent panelName={"jobs"}>
        <p>{t("Job count")}: {Object.values(this.props.jobs).length}</p>
        <JobsTable {...this.props} more={true} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const JobsPanel = connect(mapStateToProps)(RawJobsPanel);

export interface JobsAndLogsProps {
  dispatch: Function;
  logs: TaggedLog[];
  timeSettings: TimeSettings;
  sourceFbosConfig: SourceFbosConfig;
  getConfigValue: GetWebAppConfigValue;
  bot: BotState;
  fbosVersion: string | undefined;
  jobsPanelState: JobsAndLogsState;
  jobs: Dictionary<JobProgress | undefined>;
  device: TaggedDevice;
}

export class JobsAndLogs
  extends React.Component<JobsAndLogsProps> {

  setPanelState = (key: keyof JobsAndLogsState) => () =>
    this.props.dispatch({
      type: Actions.SET_JOBS_PANEL_OPTION,
      payload: key,
    });

  Jobs = () => {
    return <div className={"jobs-tab"}>
      <JobsTable jobs={this.props.bot.hardware.jobs}
        timeSettings={this.props.timeSettings} />
    </div>;
  };

  Logs = () => {
    return <div className={"logs-tab"}>
      <LogsPanel
        logs={this.props.logs}
        timeSettings={this.props.timeSettings}
        dispatch={this.props.dispatch}
        sourceFbosConfig={this.props.sourceFbosConfig}
        getConfigValue={this.props.getConfigValue}
        bot={this.props.bot}
        device={this.props.device}
        fbosVersion={this.props.fbosVersion}
      />
    </div>;
  };

  render() {
    const { jobs, logs } = this.props.jobsPanelState;
    return <div className={"jobs-and-logs"}>
      <div className={"tabs"}>
        <label className={jobs ? "selected" : ""}
          onClick={this.setPanelState("jobs")}>{t("jobs")}</label>
        <label className={logs ? "selected" : ""}
          onClick={this.setPanelState("logs")}>{t("logs")}</label>
      </div>
      {jobs && <this.Jobs />}
      {logs && <this.Logs />}
    </div>;
  }
}

export interface JobsTableProps {
  jobs: Dictionary<JobProgress | undefined>;
  timeSettings: TimeSettings;
  more?: boolean;
}

export const JobsTable = (props: JobsTableProps) => {
  const sortedJobs = sortJobs(props.jobs);
  const JobRow = Job(props);
  return <table>
    <thead>
      <tr>
        <th>{t("Job")}</th>
        {props.more && <th>{t("Type")}</th>}
        {props.more && <th>{t("ext")}</th>}
        <th className={"right-align"}>{props.more ? t("Progress") : "%"}</th>
        <th>{t("Status")}</th>
        {props.more && <th>{t("Time")}</th>}
        <th className={"right-align"}>
          <i className={"fa fa-clock-o"} title={t("duration")} />
        </th>
      </tr>
    </thead>
    <tbody>
      {sortedJobs.active.map(JobRow)}
      {sortedJobs.inactive.map(JobRow)}
    </tbody>
  </table>;
};

interface JobProps {
  timeSettings: TimeSettings;
  more?: boolean;
}

const Job = (props: JobProps) => (job: JobProgressWithTitle) => {
  const percent = job.unit == "percent" && job.percent;
  const color = percent == 100 ? Color.green : Color.yellow;
  return <tr key={job.title}>
    <td className={"job-name"} title={job.title}>
      {props.more ? job.title : jobNameLookup(job)}</td>
    {props.more && <td>{job.type}</td>}
    {props.more && <td>{job.file_type}</td>}
    <td className={"right-align"}>
      {job.unit == "percent" ? `${round(job[job.unit], 1)}%` : job[job.unit]}
      <div className={"progress"}
        style={percent
          ? { width: `${percent}%`, background: color }
          : {}} />
    </td>
    <td>{job.status}</td>
    {props.more && <td title={`${job.time} (${moment(job.time).toString()})`}>
      {job.time
        ? formatTime(moment(job.time), props.timeSettings)
        : ""}</td>}
    <td className={"right-align"}>{duration(job)}</td>
  </tr>;
};

export const isJobDone = (job: JobProgress | undefined) =>
  !job || ["complete", "error"].includes("" + job.status.toLowerCase());

const duration = (job: JobProgressWithTitle) => {
  if (!job.time) { return ""; }
  const updatedAt = job.updated_at * 1000;
  const last = isJobDone(job) ? updatedAt : moment.now();
  const seconds = round((last - moment(job.time).valueOf()) / 1000);
  return seconds > 0 ? `${seconds}s` : "";
};

export const isImageUploadJob = (jobType: string, jobTitle: string) =>
  jobType == "image" && jobTitle.includes("/");

const isOSUpdateJob = (jobType: string, jobTitle: string) =>
  jobType.toLowerCase() == "ota" && jobTitle == "FBOS_OTA";

export const jobNameLookup = (job: JobProgressWithTitle | undefined) => {
  if (!job) { return ""; }
  if (isImageUploadJob(job.type, job.title)) { return t("Photo upload"); }
  if (isOSUpdateJob(job.type, job.title)) { return t("FarmBot OS update"); }
  return job.title;
};

export const addTitleToJobProgress = ([title, job]: [string, JobProgress]) => {
  const jobWithTitle = cloneDeep(job) as JobProgressWithTitle;
  jobWithTitle.title = title;
  return jobWithTitle;
};

export const sortJobs =
  (jobs: Dictionary<JobProgress | undefined>): {
    active: JobProgressWithTitle[],
    inactive: JobProgressWithTitle[],
  } => {
    const jobsWithTitle = betterCompact(Object.entries(jobs)
      .filter(([_title, job]) => job))
      .map(addTitleToJobProgress);
    const activeJobs = sortBy(
      jobsWithTitle.filter(job => !isJobDone(job)),
      job => moment.now() - moment(job.time).unix()).reverse();
    const inactiveJobs = sortBy(
      jobsWithTitle.filter(job => isJobDone(job)),
      job => job.time).reverse();
    return { active: activeJobs, inactive: inactiveJobs };
  };

interface JobPercentProgressWithTitle extends PercentageProgress {
  title: string;
}

interface JobBytesProgressWithTitle extends BytesProgress {
  title: string;
}

type JobProgressWithTitle =
  JobPercentProgressWithTitle | JobBytesProgressWithTitle;
