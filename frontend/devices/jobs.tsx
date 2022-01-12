import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { Everything, TimeSettings } from "../interfaces";
import {
  BytesProgress, Dictionary, JobProgress, PercentageProgress,
} from "farmbot";
import { t } from "../i18next_wrapper";
import { maybeGetTimeSettings } from "../resources/selectors";
import moment from "moment";
import { betterCompact, formatTime } from "../util";
import { Color } from "../ui";
import { round, sortBy } from "lodash";
import { Content } from "../constants";

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
        <th>{t("Type")}</th>
        {props.more && <th>{t("ext")}</th>}
        <th>{props.more ? t("Progress") : "%"}</th>
        <th>{t("Status")}</th>
        <th>{t("Time")}</th>
        <th>{t("Duration")}</th>
      </tr>
    </thead>
    <tbody>
      {sortedJobs.active.map(JobRow)}
      <i>{t(Content.OLD_JOBS_CLEARED)}</i>
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
    <td>{job.type}</td>
    {props.more && <td>{job.file_type}</td>}
    <td>
      {job.unit == "percent" ? `${job[job.unit]}%` : job[job.unit]}
      <div className={"progress"}
        style={percent
          ? { width: `${percent}%`, background: color }
          : {}} />
    </td>
    <td>{job.status}</td>
    <td title={job.time}>{job.time
      ? formatTime(moment(job.time), props.timeSettings)
      : ""}</td>
    <td>{duration(job)}</td>
  </tr>;
};

const duration = (job: JobProgressWithTitle) => {
  if (!job.time || job.status != "working") { return ""; }
  return `${round((moment.now() - moment(job.time).valueOf()) / 1000)}s`;
};

export const isImageUploadJob = (jobType: string, jobTitle: string) =>
  jobType == "image" && jobTitle.includes("/");

const isOSUpdateJob = (jobType: string, jobTitle: string) =>
  jobType == "ota" && jobTitle == "FBOS_OTA";

export const jobNameLookup = (job: JobProgressWithTitle | undefined) => {
  if (!job) { return ""; }
  if (isImageUploadJob(job.type, job.title)) { return t("Photo upload"); }
  if (isOSUpdateJob(job.type, job.title)) { return t("OS update"); }
  return job.title;
};

export const addTitleToJobProgress = ([title, job]: [string, JobProgress]) => {
  (job as JobProgressWithTitle).title = title;
  return (job as JobProgressWithTitle);
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
      jobsWithTitle.filter(job => job.status == "working"),
      job => moment.now() - moment(job.time).unix());
    const inactiveJobs = sortBy(
      jobsWithTitle.filter(job => job.status != "working"),
      job => job.time);
    return { active: activeJobs, inactive: inactiveJobs };
  };

interface JobPercentProgressWithTitle extends PercentageProgress {
  title: string;
}

interface JobBytesProgressWithTitle extends BytesProgress {
  title: string;
}

export type JobProgressWithTitle =
  JobPercentProgressWithTitle | JobBytesProgressWithTitle;
