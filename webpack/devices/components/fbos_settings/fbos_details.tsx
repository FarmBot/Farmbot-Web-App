import * as React from "react";
import { Saucer } from "../../../ui/index";
import { t } from "i18next";
import { ToggleButton } from "../../../controls/toggle_button";
import { updateConfig } from "../../actions";
import { last, isNumber } from "lodash";
import { Content } from "../../../constants";
import { FbosDetailsProps } from "./interfaces";
import { SourceFbosConfig, ShouldDisplay, Feature } from "../../interfaces";
import { ConfigurationName } from "farmbot";

/** Return an indicator color for the given temperature (C). */
export const colorFromTemp = (temp: number | undefined): string => {
  if (!temp) {
    return "gray";
  }
  if (temp < 0) {
    return "lightblue";
  } else if (temp < 10) {
    return "blue";
  } else if (temp > 75) {
    return "red";
  } else if (temp > 60) {
    return "yellow";
  } else {
    return "green";
  }
};

/** RPI CPU temperature display row: label, temperature, indicator. */
export function ChipTemperatureDisplay({ chip, temperature }: {
  chip?: string, temperature: number | undefined
}): JSX.Element {
  return <div className="chip-temp-display">
    <p>
      <b>{chip && chip.toUpperCase()} {t("CPU temperature")}: </b>
      {temperature ? <span>{temperature}&deg;C</span> : t("unknown")}
    </p>
    {<Saucer color={colorFromTemp(temperature)} className={"small-inline"} />}
  </div>;
}

/** WiFi signal strength display row: label, strength, indicator. */
export function WiFiStrengthDisplay({ wifiStrength }: {
  wifiStrength: number | undefined
}): JSX.Element {
  const percent = wifiStrength
    ? Math.round(-0.0154 * wifiStrength ** 2 - 0.4 * wifiStrength + 98)
    : 0;
  const dbString = `${wifiStrength || 0}dBm`;
  const percentString = `${percent}%`;
  return <div className="wifi-strength-display">
    <p>
      <b>{t("WiFi Strength")}: </b>
      {wifiStrength ? dbString : "N/A"}
    </p>
    {wifiStrength &&
      <div className="percent-bar">
        <div
          className="percent-bar-fill"
          style={{ width: percentString }}
          title={dbString} />
      </div>}
  </div>;
}

/** Get the first 8 characters of a commit. */
const shortenCommit = (longCommit: string) => (longCommit || "").slice(0, 8);

/** GitHub commit display row: label, commit link. */
const CommitDisplay = ({ title, repo, commit }: {
  title: string, repo: string, commit: string
}): JSX.Element => {
  const shortCommit = shortenCommit(commit);
  return <p>
    <b>{title}: </b>
    {shortCommit === "---"
      ? shortCommit
      : <a
        href={`https://github.com/FarmBot/${repo}/tree/${shortCommit}`}
        target="_blank">
        {shortCommit}
      </a>}
  </p>;
};

/** FBOS uptime display row: label and uptime in relevant unit. */
const UptimeDisplay = ({ uptime_sec }: { uptime_sec: number }): JSX.Element => {
  const convertUptime = (seconds: number) => {
    if (seconds >= 172800) {
      return `${Math.round(seconds / 86400)} ${t("days")}`;
    } else if (seconds >= 7200) {
      return `${Math.round(seconds / 3600)} ${t("hours")}`;
    } else if (seconds >= 120) {
      return `${Math.round(seconds / 60)} ${t("minutes")}`;
    } else {
      return `${seconds} ${t("seconds")}`;
    }
  };
  return <p><b>{t("Uptime")}: </b>{convertUptime(uptime_sec)}</p>;
};

export const betaReleaseOptIn = ({ sourceFbosConfig, shouldDisplay }: {
  sourceFbosConfig: SourceFbosConfig, shouldDisplay: ShouldDisplay
}) => {
  if (shouldDisplay(Feature.use_update_channel)) {
    const betaOptIn = sourceFbosConfig("update_channel" as ConfigurationName);
    const betaOptInValue = betaOptIn.value !== "stable";
    return {
      betaOptIn: { value: betaOptInValue, consistent: true }, betaOptInValue,
      update: { update_channel: betaOptInValue ? "stable" : "beta" }
    };
  } else {
    const betaOptIn = sourceFbosConfig("beta_opt_in");
    const betaOptInValue = betaOptIn.value;
    return {
      betaOptIn, betaOptInValue,
      update: { beta_opt_in: !betaOptInValue }
    };
  }
};

/** Label and toggle button for opting in to FBOS beta releases. */
const BetaReleaseOptInButton =
  ({ dispatch, sourceFbosConfig, shouldDisplay }: {
    dispatch: Function,
    sourceFbosConfig: SourceFbosConfig,
    shouldDisplay: ShouldDisplay,
  }): JSX.Element => {
    const { betaOptIn, betaOptInValue, update } =
      betaReleaseOptIn({ sourceFbosConfig, shouldDisplay });
    return <fieldset>
      <label style={{ marginTop: "0.75rem" }}>
        {t("Beta release Opt-In")}
      </label>
      <ToggleButton
        toggleValue={betaOptInValue}
        dim={!betaOptIn.consistent}
        toggleAction={() =>
          (betaOptInValue || confirm(Content.OS_BETA_RELEASES)) &&
          dispatch(updateConfig(update))} />
    </fieldset>;
  };

/** Current technical information about FarmBot OS running on the device. */
export function FbosDetails(props: FbosDetailsProps) {
  const {
    env, commit, target, node_name, firmware_version, firmware_commit,
    soc_temp, wifi_level, uptime, memory_usage, disk_usage
  } = props.botInfoSettings;

  return <div>
    <p><b>Environment: </b>{env}</p>
    <CommitDisplay title={"Commit"} repo={"farmbot_os"} commit={commit} />
    <p><b>Target: </b>{target}</p>
    <p><b>Node name: </b>{last((node_name || "").split("@"))}</p>
    <p><b>Firmware: </b>{firmware_version}</p>
    <CommitDisplay title={"Firmware commit"}
      repo={"farmbot-arduino-firmware"} commit={firmware_commit} />
    {isNumber(uptime) && <UptimeDisplay uptime_sec={uptime} />}
    {isNumber(memory_usage) &&
      <p><b>{t("Memory usage")}: </b>{memory_usage}MB</p>}
    {isNumber(disk_usage) && <p><b>{t("Disk usage")}: </b>{disk_usage}%</p>}
    <ChipTemperatureDisplay chip={target} temperature={soc_temp} />
    <WiFiStrengthDisplay wifiStrength={wifi_level} />
    <BetaReleaseOptInButton
      dispatch={props.dispatch}
      shouldDisplay={props.shouldDisplay}
      sourceFbosConfig={props.sourceFbosConfig} />
  </div>;
}
