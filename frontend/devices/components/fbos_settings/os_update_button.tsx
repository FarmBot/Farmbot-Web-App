import * as React from "react";
import { t } from "i18next";
import { JobProgress, ConfigurationName } from "farmbot/dist";
import { SemverResult, semverCompare } from "../../../util";
import { OsUpdateButtonProps } from "./interfaces";
import { checkControllerUpdates } from "../../actions";
import { isString } from "lodash";
import { BotState, Feature } from "../../interfaces";
import { Content } from "../../../constants";

/** FBOS update button states. */
enum UpdateButton { upToDate, needsUpdate, unknown, none }

interface ButtonProps {
  color: "green" | "gray" | "yellow";
  text: string;
  hoverText: string | undefined;
}

/** FBOS update button state => props. */
const buttonProps =
  (status: UpdateButton, hoverText: string | undefined): ButtonProps => {
    switch (status) {
      case UpdateButton.needsUpdate:
        return { color: "green", text: t("UPDATE"), hoverText };
      case UpdateButton.upToDate:
        return { color: "gray", text: t("UP TO DATE"), hoverText };
      case UpdateButton.unknown:
        const text = t("Can't connect to release server");
        return { color: "yellow", text, hoverText };
      default:
        return { color: "yellow", text: t("Can't connect to bot"), hoverText };
    }
  };

/** FBOS update download in progress. */
const isWorking = (job: JobProgress | undefined) =>
  job && (job.status == "working");

/** FBOS update download progress. */
export function downloadProgress(job: JobProgress | undefined) {
  if (job && isWorking(job)) {
    switch (job.unit) {
      case "bytes":
        const kiloBytes = Math.round(job.bytes / 1024);
        const megaBytes = Math.round(job.bytes / 1048576);
        if (kiloBytes < 1) {
          return job.bytes + "B";
        } else if (megaBytes < 1) {
          return kiloBytes + "kB";
        } else {
          return megaBytes + "MB";
        }
      case "percent":
        return job.percent + "%";
    }
  }
}

/** Determine the latest available version. */
const getLatestVersion = (
  currentOSVersion: string | undefined,
  currentBetaOSVersion: string | undefined,
  betaOptIn: boolean
): string | undefined => {
  if (!betaOptIn) { return currentOSVersion; }
  switch (semverCompare(currentOSVersion || "", currentBetaOSVersion || "")) {
    case SemverResult.RIGHT_IS_GREATER: return currentBetaOSVersion;
    default: return currentOSVersion;
  }
};

/** Determine the installed version. */
const getInstalledVersion = (
  controllerVersion: string | undefined,
  currentlyOnBeta: boolean,
): string | undefined => {
  if (!isString(controllerVersion)) { return undefined; }
  return currentlyOnBeta ? controllerVersion + "-beta" : controllerVersion;
};

/** Unequal beta commits => needs update. */
const betaCommitsAreEqual = (
  fbosCommit: string | undefined,
  currentBetaOSCommit: string | undefined): boolean =>
  !(isString(fbosCommit) && isString(currentBetaOSCommit)
    && fbosCommit !== currentBetaOSCommit);

/** Determine the FBOS update button state. */
const compareWithBotVersion = (
  candidate: string | undefined,
  installedVersion: string | undefined
): UpdateButton => {
  if (!isString(installedVersion)) { return UpdateButton.none; }
  if (!isString(candidate)) { return UpdateButton.unknown; }

  // If all values are known, match comparison result with button state.
  switch (semverCompare(candidate, installedVersion)) {
    case SemverResult.RIGHT_IS_GREATER:
    case SemverResult.EQUAL:
      return UpdateButton.upToDate;
    default:
      return UpdateButton.needsUpdate;
  }
};

/** Installed version equal to latest. */
const equalToLatest = (
  latest: string | undefined,
  installedVersion: string | undefined
): boolean =>
  isString(installedVersion) && isString(latest) &&
  semverCompare(installedVersion, latest) === SemverResult.EQUAL;

/** Color, text, and hover text for update button: release version status. */
const buttonVersionStatus =
  ({ bot, betaOptIn }: { bot: BotState, betaOptIn: boolean, }): ButtonProps => {
    // Information about available releases.
    const { currentOSVersion, currentBetaOSVersion, currentBetaOSCommit } = bot;
    // Currently installed FBOS version data.
    const botInfo = bot.hardware.informational_settings;
    const {
      controller_version, commit, currently_on_beta, update_available
    } = botInfo;

    /** Newest release version, given settings and data available. */
    const latestReleaseV =
      getLatestVersion(currentOSVersion, currentBetaOSVersion, betaOptIn);
    /** Installed version. */
    const installedVersion =
      getInstalledVersion(controller_version, !!currently_on_beta);
    /** FBOS update button status. */
    const btnStatus = compareWithBotVersion(latestReleaseV, installedVersion);

    /** Beta update special cases. */
    const uncertainty = (btnStatus === UpdateButton.upToDate) &&
      equalToLatest(latestReleaseV, installedVersion) && betaOptIn;
    /** `1.0.0-beta vs 1.0.0-beta`: installed beta is older. */
    const oldBetaCommit = (latestReleaseV === currentBetaOSVersion) &&
      !betaCommitsAreEqual(commit, currentBetaOSCommit);
    /** Button status modification required for release edge cases. */
    const updateStatusOverride = update_available
      || (uncertainty && oldBetaCommit);

    return buttonProps(
      updateStatusOverride ? UpdateButton.needsUpdate : btnStatus,
      latestReleaseV);
  };

/** Shows update availability or download progress. Updates FBOS on click. */
export const OsUpdateButton = (props: OsUpdateButtonProps) => {
  const { bot, sourceFbosConfig, botOnline } = props;
  const { controller_version } = bot.hardware.informational_settings;

  /** FBOS beta release opt-in setting. */
  const betaOptIn = props.shouldDisplay(Feature.use_update_channel)
    ? sourceFbosConfig("update_channel" as ConfigurationName).value !== "stable"
    : !!sourceFbosConfig("beta_opt_in").value;
  /** FBOS update availability. */
  const buttonStatusProps = buttonVersionStatus({ bot, betaOptIn });

  /** FBOS update download progress data. */
  const osUpdateJob = (bot.hardware.jobs || {})["FBOS_OTA"];

  const tooOld = controller_version
    && (semverCompare("6.0.0", controller_version)
      === SemverResult.LEFT_IS_GREATER ? Content.TOO_OLD_TO_UPDATE : undefined);

  return <button
    className={`fb-button ${tooOld ? "yellow" : buttonStatusProps.color}`}
    title={buttonStatusProps.hoverText}
    disabled={isWorking(osUpdateJob) || !botOnline}
    onClick={checkControllerUpdates}>
    {tooOld || downloadProgress(osUpdateJob) || buttonStatusProps.text}
  </button>;
};
