import * as React from "react";
import { t } from "i18next";
import * as _ from "lodash";
import { JobProgress } from "farmbot/dist";
import { SemverResult, semverCompare } from "../../../util";
import { OsUpdateButtonProps } from "./interfaces";
import { checkControllerUpdates } from "../../actions";

enum UpdateButton { upToDate, needsUpdate, unknown, unknownBeta, none }

const buttonProps = (status: UpdateButton) => {
  switch (status) {
    case UpdateButton.needsUpdate:
      return { color: "green", text: t("UPDATE") };
    case UpdateButton.upToDate:
      return { color: "gray", text: t("UP TO DATE") };
    case UpdateButton.unknownBeta:
      return { color: "yellow", text: t("No beta releases available") };
    case UpdateButton.unknown:
      return { color: "yellow", text: t("Can't connect to release server") };
    default:
      return { color: "yellow", text: t("Can't connect to bot") };
  }
};

export let OsUpdateButton = (props: OsUpdateButtonProps) => {
  const { bot, sourceFbosConfig } = props;
  let buttonStatus = UpdateButton.none;

  const betaOptIn = sourceFbosConfig("beta_opt_in").value;
  const { currentOSVersion, currentBetaOSVersion, currentBetaOSCommit } = bot;
  const { commit } = bot.hardware.informational_settings;
  const latestReleaseV = betaOptIn
    ? currentBetaOSVersion
    : currentOSVersion;
  const { controller_version } = bot.hardware.informational_settings;
  if (_.isString(latestReleaseV) && _.isString(controller_version)) {
    switch (semverCompare(latestReleaseV, controller_version)) {
      case SemverResult.RIGHT_IS_GREATER:
      case SemverResult.EQUAL:
        buttonStatus = UpdateButton.upToDate;
        break;
      default:
        buttonStatus = UpdateButton.needsUpdate;
    }
  } else {
    if (!_.isString(latestReleaseV)) {
      buttonStatus = betaOptIn
        ? UpdateButton.unknownBeta
        : UpdateButton.unknown;
    }
  }
  if (betaOptIn
    && _.isString(commit) && _.isString(currentBetaOSCommit)
    && commit !== currentBetaOSCommit) {
    buttonStatus = UpdateButton.needsUpdate;
  }

  const osUpdateJob = (bot.hardware.jobs || {})["FBOS_OTA"];

  const isWorking = (job: JobProgress | undefined) =>
    job && (job.status == "working");

  function downloadProgress(job: JobProgress | undefined) {
    if (job && isWorking(job)) {
      switch (job.unit) {
        case ("bytes"):
          const kiloBytes = Math.round(job.bytes / 1024);
          const megaBytes = Math.round(job.bytes / 1048576);
          if (kiloBytes < 1) {
            return job.bytes + "B";
          } else if (megaBytes < 1) {
            return kiloBytes + "kB";
          } else {
            return megaBytes + "MB";
          }
        case ("percent"):
          return job.percent + "%";
      }
    }
  }

  return <button
    className={"fb-button " + buttonProps(buttonStatus).color}
    title={latestReleaseV}
    disabled={isWorking(osUpdateJob)}
    onClick={() => checkControllerUpdates()}>
    {downloadProgress(osUpdateJob) || buttonProps(buttonStatus).text}
  </button>;
};
