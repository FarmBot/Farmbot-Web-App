import React from "react";
import { Saucer, FBSelect, Help, Popover } from "../../ui";
import { updateConfig } from "../../devices/actions";
import { last, isNumber, isString } from "lodash";
import { Content, ToolTips } from "../../constants";
import { FbosDetailsProps } from "./interfaces";
import { SourceFbosConfig } from "../../devices/interfaces";
import { t } from "../../i18next_wrapper";
import { LastSeen } from "./last_seen_row";
import moment from "moment";
import { formatTime } from "../../util";
import {
  boardType, FIRMWARE_CHOICES_DDI, hasZero2, validFirmwareHardware,
} from "../firmware/firmware_hardware_support";
import { ExternalUrl, FarmBotRepo } from "../../external_urls";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { getModifiedClassName } from "./default_values";
import { FirmwareHardware } from "farmbot";

/** Return an indicator color for the given temperature (C). */
export const colorFromTemp = (temp: number | undefined): string => {
  if (!isNumber(temp)) {
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

interface ChipTemperatureDisplayProps {
  chip?: string;
  temperature: number | undefined;
}

/** RPI CPU temperature display row: label, temperature, indicator. */
export function ChipTemperatureDisplay(
  { chip, temperature }: ChipTemperatureDisplayProps,
): React.ReactNode {
  return <div className="chip-temp-display">
    <p>
      <b>{chip && chip.toUpperCase()} {t("CPU temperature")}: </b>
      {isNumber(temperature) ? <span>{temperature}&deg;C</span> : t("Unknown")}
    </p>
    <Saucer color={colorFromTemp(temperature)} className={"small-inline"} />
  </div>;
}

export interface PiDisplayProps {
  chip: string;
  firmware: FirmwareHardware | undefined;
}

/** RPI model display row. */
export const PiDisplay = ({ chip, firmware }: PiDisplayProps): React.ReactNode => {
  const pi = () => {
    switch (chip) {
      case "rpi": return "Zero W";
      case "rpi3": return hasZero2(firmware) ? "Zero 2 W" : "3";
      case "rpi4": return "4";
      default: return t("Unknown");
    }
  };
  return <div className={"pi-display"}>
    <p><b>{t("Raspberry Pi")}: </b>{pi()}</p>
  </div>;
};

/** Return an indicator color for the given memory usage (MB). */
export const colorFromMemoryUsage = (usage: number | undefined) => {
  if (!isNumber(usage)) { return "gray"; }
  if (usage > 340) {
    return "red";
  } else if (usage < 170) {
    return "green";
  } else {
    return "yellow";
  }
};

interface MemoryUsageDisplayProps {
  usage: number | undefined;
}

/** Memory usage display row: label, memory usage, indicator. */
export const MemoryUsageDisplay = ({ usage }: MemoryUsageDisplayProps) =>
  <div className={"memory-usage-display"}>
    <p>
      <b>{t("Memory usage")}: </b>
      {isNumber(usage) ? <span>{usage}MB</span> : t("Unknown")}
    </p>
    <Saucer color={colorFromMemoryUsage(usage)} className={"small-inline"} />
  </div>;

interface CameraIndicatorProps {
  videoDevices: string | undefined;
}

/** Camera connection status indicator. */
export const CameraIndicator = ({ videoDevices }: CameraIndicatorProps) => {
  const camera = videoDevices &&
    videoDevices.toString().trim().split(",").length > 0;
  return <div className={"camera-connection-indicator"}>
    <p>
      <b>{t("Camera")}: </b>
      <span>{camera ? t("Connected") : t("Unknown")}</span>
    </p>
    <Saucer color={camera ? "green" : "gray"} className={"small-inline"} />
  </div>;
};

/** Return an indicator color for the given WiFi signal strength (%). */
const colorFromSignalStrength = (percent: number) => {
  if (percent < 20) {
    return "gray";
  } else if (percent < 68) {
    return "red";
  } else if (percent < 84) {
    return "yellow";
  } else {
    return "green";
  }
};

const WIFI_COLOR_KEY = () => ({
  gray: t("too weak"),
  red: t("weak"),
  yellow: t("ok"),
  green: t("good"),
});

interface WiFiStrengthDisplayProps {
  wifiStrength: number | undefined;
  wifiStrengthPercent?: number | undefined;
  extraInfo?: boolean;
}

/** WiFi signal strength display row: label, strength, indicator. */
export function WiFiStrengthDisplay(
  { wifiStrength, wifiStrengthPercent, extraInfo }: WiFiStrengthDisplayProps,
): React.ReactNode {
  const calculatedPercent = wifiStrength
    ? Math.round(-0.0154 * wifiStrength ** 2 - 0.4 * wifiStrength + 98)
    : 0;
  const valueAvailable = isWifi(wifiStrength, wifiStrengthPercent);
  const percent = wifiStrengthPercent || calculatedPercent;
  const dbString = `${wifiStrength || 0}dBm`;
  const percentString = `${percent}%`;
  const color = colorFromSignalStrength(percent);
  const qualityString = `(${WIFI_COLOR_KEY()[color]})`;
  const numberDisplay = `${percentString} ${extraInfo ? qualityString : ""}`;
  return <div className="wifi-strength-display">
    <p>
      <b>{t("WiFi strength")}: </b>
      {valueAvailable ? numberDisplay : "N/A"}
    </p>
    {valueAvailable &&
      <div className="percent-bar"
        title={`${dbString} ${qualityString}`}>
        <div className={`percent-bar-fill ${color}`}
          style={{ width: percentString }} />
      </div>}
  </div>;
}

export const isWifi = (
  wifiStrength: number | undefined,
  wifiStrengthPercent: number | undefined,
) =>
  isNumber(wifiStrength) || isNumber(wifiStrengthPercent);

export const LocalIpAddress = ({ address }: { address: string | undefined }) =>
  <p className={"ip-address"}><b>{t("Local IP")}: </b>{address || "---"}</p>;

const calcMac =
  (nodeName: string | undefined, target: string | undefined, wifi: boolean) => {
    if (!isString(nodeName) || nodeName.includes("---") || !nodeName) {
      return "---";
    }
    const firstHalf = target == "rpi4" ? "dca632" : "b827eb";
    const snLast6 = nodeName.split(".")[0].slice(-6);
    const lastHalf = wifi
      // eslint-disable-next-line no-bitwise
      ? (parseInt(snLast6, 16) ^ parseInt("555555", 16)).toString(16)
      : snLast6;
    const address = firstHalf + lastHalf;
    const formattedAddress = (address.match(/.{1,2}/g) as string[]).join(":");
    return formattedAddress;
  };

export interface MacAddressProps {
  wifi: boolean;
  nodeName: string | undefined;
  target: string | undefined;
}

export const MacAddress = ({ wifi, nodeName, target }: MacAddressProps) =>
  <p className={"mac-address"}>
    <b>{t("MAC address")}: </b>{calcMac(nodeName, target, wifi)}
  </p>;

/** Available throttle info. */
export enum ThrottleType {
  UnderVoltage = "UnderVoltage",
  ArmFrequencyCapped = "ArmFrequencyCapped",
  Throttled = "Throttled",
  SoftTempLimit = "SoftTempLimit",
}

/** Bit positions for throttle flags. */
const THROTTLE_BIT_LOOKUP:
  Record<ThrottleType, Record<"active" | "occurred", number>> =
{
  [ThrottleType.UnderVoltage]: { active: 0, occurred: 16 },
  [ThrottleType.ArmFrequencyCapped]: { active: 1, occurred: 17 },
  [ThrottleType.Throttled]: { active: 2, occurred: 18 },
  [ThrottleType.SoftTempLimit]: { active: 3, occurred: 19 },
};

/** Return a color based on throttle flag states. */
export const colorFromThrottle =
  (throttled: string | undefined, throttleType: ThrottleType) => {
    if (!throttled) { return "gray"; }
    const throttleCode = parseInt(throttled, 16);
    const bit = THROTTLE_BIT_LOOKUP[throttleType];
    // eslint-disable-next-line no-bitwise
    const active = throttleCode & (1 << bit.active);
    // eslint-disable-next-line no-bitwise
    const occurred = throttleCode & (1 << bit.occurred);
    if (active) {
      return "red";
    } else if (occurred) {
      return "yellow";
    } else {
      return "green";
    }
  };

const THROTTLE_COLOR_KEY = () => ({
  red: t("Active"),
  yellow: t("Occurred"),
  green: t("Ok"),
  gray: t("Unknown"),
});

const VOLTAGE_COLOR_KEY = () => ({
  red: t("Low"),
  yellow: t("Ok"),
  green: t("Good"),
  gray: t("Unknown"),
});

interface ThrottleIndicatorProps {
  throttleDataString: string | undefined;
  throttleType: ThrottleType;
}

/** Saucer with color and title indicating throttle state. */
export const ThrottleIndicator = (props: ThrottleIndicatorProps) => {
  const { throttleDataString, throttleType } = props;
  const throttleColor = colorFromThrottle(throttleDataString, throttleType);
  return <Saucer className={"small-inline"}
    title={THROTTLE_COLOR_KEY()[throttleColor]}
    color={throttleColor} />;
};

/** Visual representation of throttle state. */
const ThrottleDisplay = (dataString: string | undefined) =>
  <div className="throttle-display">
    {Object.keys(THROTTLE_BIT_LOOKUP).map((key: ThrottleType) =>
      <div className="throttle-row" key={key}>
        <ThrottleIndicator throttleDataString={dataString} throttleType={key} />
        <p><b>{key}</b></p>
        <p>: {THROTTLE_COLOR_KEY()[colorFromThrottle(dataString, key)]}</p>
      </div>)}
  </div>;

interface VoltageDisplayProps {
  chip?: string;
  throttleData: string | undefined;
}

/** RPI throttle state display row: label, indicator. */
export const VoltageDisplay = ({ chip, throttleData }: VoltageDisplayProps) => {
  const voltageColor = colorFromThrottle(throttleData, ThrottleType.UnderVoltage);
  return <div className="voltage-display">
    <p><b>{chip && chip.toUpperCase()} {t("Voltage")}</b></p>
    <Help text={ToolTips.VOLTAGE_STATUS} />
    <p>:&nbsp;{VOLTAGE_COLOR_KEY()[voltageColor]}</p>
    <Popover usePortal={false} className={"voltage-saucer"}
      target={<ThrottleIndicator
        throttleDataString={throttleData}
        throttleType={ThrottleType.UnderVoltage} />}
      content={ThrottleDisplay(throttleData)} />
  </div>;
};

/** Get the first 8 characters of a commit. */
const shortenCommit = (longCommit: string) => (longCommit || "").slice(0, 8);

interface CommitDisplayProps {
  title: string;
  repo: FarmBotRepo;
  commit: string;
}

/** GitHub commit display row: label, commit link. */
const CommitDisplay = (
  { title, repo, commit }: CommitDisplayProps,
): React.ReactNode => {
  const shortCommit = shortenCommit(commit);
  return <p>
    <b>{title}: </b>
    {shortCommit === "---"
      ? shortCommit
      : <a
        href={`${ExternalUrl.gitHubFarmBot}/${repo}/tree/${shortCommit}`}
        target="_blank" rel={"noreferrer"}>
        {shortCommit}
      </a>}
  </p>;
};

export const convertUptime = (seconds: number, abrv = false) => {
  if (seconds >= 172800) {
    return `${Math.round(seconds / 86400)} ${t("days")}`;
  } else if (seconds >= 7200) {
    return `${Math.round(seconds / 3600)} ${t("hours")}`;
  } else if (seconds >= 120) {
    return `${Math.round(seconds / 60)} ${abrv ? t("min") : t("minutes")}`;
  } else {
    return `${seconds} ${abrv ? t("sec") : t("seconds")}`;
  }
};

interface UptimeDisplayProps {
  uptime_sec: number;
}

/** FBOS uptime display row: label and uptime in relevant unit. */
const UptimeDisplay = ({ uptime_sec }: UptimeDisplayProps): React.ReactNode => {
  return <p><b>{t("Uptime")}: </b>{convertUptime(uptime_sec)}</p>;
};

export interface OSReleaseChannelSelectionProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

/** Label and dropdown for selecting FBOS release channel. */
export const OSReleaseChannelSelection = (
  { dispatch, sourceFbosConfig }: OSReleaseChannelSelectionProps,
): React.ReactNode => {
  const channel = sourceFbosConfig("update_channel").value;
  const firmwareHardware = validFirmwareHardware(
    sourceFbosConfig("firmware_hardware").value);
  return <fieldset className={"os-release-channel"}>
    <label>
      {t("OS release channel")}
    </label>
    <FBSelect
      extraClass={getModifiedClassName("update_channel", channel, firmwareHardware)}
      selectedItem={{ label: t("" + channel), value: "" + channel }}
      onChange={ddi =>
        (ddi.value == "stable" ||
          confirm(Content.UNSTABLE_RELEASE_CHANNEL_WARNING)) &&
        dispatch(updateConfig({ update_channel: "" + ddi.value }))}
      list={[
        { label: t("stable"), value: "stable" },
        { label: t("beta"), value: "beta" },
        { label: t("alpha"), value: "alpha" },
      ]} />
  </fieldset>;
};

export const reformatFwVersion =
  (firmwareVersion: string | undefined): string => {
    const version = firmwareVersion
      ? firmwareVersion.split(".").slice(0, 3).join(".")
      : "none";
    const displayVersion = version.includes("---") ? version : `v${version}`;
    const board = FIRMWARE_CHOICES_DDI[boardType(firmwareVersion)]?.label || "";
    return version == "none" ? "---" : `${displayVersion} ${board}`;
  };

export const reformatFbosVersion = (fbosVersion: string | undefined): string =>
  fbosVersion ? "v" + fbosVersion : t("Unknown");

/** Current technical information about FarmBot OS running on the device. */
export function FbosDetails(props: FbosDetailsProps) {
  const { informational_settings } = props.bot.hardware;
  const {
    env, commit, target, node_name, firmware_version, firmware_commit,
    soc_temp, wifi_level, uptime, memory_usage, disk_usage, throttled,
    wifi_level_percent, cpu_usage, private_ip, video_devices,
  } = informational_settings;
  const { fbos_version } = props.deviceAccount.body;
  const last_ota = props.deviceAccount.body[
    "last_ota" as keyof DeviceAccountSettings] as string | undefined;
  const firmware_path =
    props.sourceFbosConfig("firmware_path").value || "---";
  const firmware_hardware = validFirmwareHardware(
    props.sourceFbosConfig("firmware_hardware").value);
  const infoFwCommit = firmware_version?.includes(".") ? firmware_commit : "---";
  const firmwareCommit = firmware_version?.split("-")[1] || infoFwCommit;

  return <div className={"farmbot-os-details"}>
    <LastSeen
      dispatch={props.dispatch}
      bot={props.bot}
      timeSettings={props.timeSettings}
      device={props.deviceAccount} />
    <p><b>{t("Version last seen")}: </b>{fbos_version}</p>
    <p><b>{t("Environment")}: </b>{env}</p>
    <CommitDisplay title={t("Commit")}
      repo={FarmBotRepo.FarmBotOS} commit={commit} />
    <p><b>{t("Target")}: </b>{target}</p>
    <PiDisplay chip={target} firmware={firmware_hardware} />
    <p><b>{t("Node name")}: </b>{last((node_name || "").split("@"))}</p>
    <p><b>{t("Device ID")}: </b>{props.deviceAccount.body.id}</p>
    <LocalIpAddress address={private_ip} />
    <MacAddress nodeName={node_name} target={target}
      wifi={isWifi(wifi_level, wifi_level_percent)} />
    <p><b>{t("Firmware")}: </b>{reformatFwVersion(firmware_version)}</p>
    <CommitDisplay title={t("Firmware commit")}
      repo={FarmBotRepo.FarmBotArduinoFirmware} commit={firmwareCommit} />
    <p><b>{t("Firmware code")}: </b>{firmware_version}</p>
    <p><b>{t("Firmware path")}: </b>{firmware_path}</p>
    {isNumber(uptime) && <UptimeDisplay uptime_sec={uptime} />}
    <MemoryUsageDisplay usage={memory_usage} />
    {isNumber(disk_usage) && <p><b>{t("Disk usage")}: </b>{disk_usage}%</p>}
    {isNumber(cpu_usage) && <p><b>{t("CPU usage")}: </b>{cpu_usage}%</p>}
    <ChipTemperatureDisplay chip={target} temperature={soc_temp} />
    <WiFiStrengthDisplay extraInfo={true}
      wifiStrength={wifi_level} wifiStrengthPercent={wifi_level_percent} />
    <VoltageDisplay chip={target} throttleData={throttled} />
    <p><b>{t("Cameras")}: </b>{video_devices}</p>
    <OSReleaseChannelSelection
      dispatch={props.dispatch} sourceFbosConfig={props.sourceFbosConfig} />
    {last_ota && <p><b>{t("Last updated")}: </b>
      {formatTime(moment(last_ota), props.timeSettings, "MMMM D")}</p>}
  </div>;
}
