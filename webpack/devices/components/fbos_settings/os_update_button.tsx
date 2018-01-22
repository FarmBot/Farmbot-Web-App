import * as React from "react";
import { t } from "i18next";
import * as _ from "lodash";
import { JobProgress } from "farmbot/dist";
import { SemverResult, semverCompare } from "../../../util";
import { BotProp } from "../../interfaces";
import { checkControllerUpdates } from "../../actions";

export let OsUpdateButton = ({ bot }: BotProp) => {
  let buttonStr = "Can't Connect to bot";
  let buttonColor = "yellow";

  const { beta_opt_in } = bot.hardware.configuration;
  const { currentOSVersion, currentBetaOSVersion } = bot;
  const latestReleaseV = beta_opt_in
    ? currentBetaOSVersion
    : currentOSVersion;
  const { controller_version } = bot.hardware.informational_settings;
  if (_.isString(latestReleaseV) && _.isString(controller_version)) {
    switch (semverCompare(latestReleaseV, controller_version)) {
      case SemverResult.RIGHT_IS_GREATER:
      case SemverResult.EQUAL:
        buttonStr = t("UP TO DATE");
        buttonColor = "gray";
        break;
      default:
        buttonStr = t("UPDATE");
        buttonColor = "green";
    }
  } else {
    buttonStr = beta_opt_in
      ? "No beta releases available"
      : "Can't Connect to release server";
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
    className={"fb-button " + buttonColor}
    title={latestReleaseV}
    disabled={isWorking(osUpdateJob)}
    onClick={() => checkControllerUpdates()}>
    {downloadProgress(osUpdateJob) || buttonStr}
  </button>;
};
