import { AddEditFarmEventProps } from "../interfaces";
import { Everything } from "../../interfaces";
import * as moment from "moment";
import { t } from "i18next";
import { history, getPathArray } from "../../history";
import {
  selectAllFarmEvents,
  indexRegimenById,
  indexSequenceById,
  indexFarmEventById,
  findFarmEventById,
  selectAllRegimens,
  selectAllSequences,
  findSequenceById,
  findRegimenById,
  getDeviceAccountSettings,
  maybeGetDevice
} from "../../resources/selectors";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen
} from "farmbot";
import { DropDownItem } from "../../ui/index";
import {
  validFbosConfig, shouldDisplay, determineInstalledOsVersion
} from "../../util";
import { sourceFbosConfigValue } from "../../devices/components/source_config_value";
import { Feature } from "../../devices/interfaces";
import { hasId } from "../../resources/util";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { getFbosConfig } from "../../resources/getters";

export let formatTime = (input: string, timeOffset: number) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeOffset).format("HH:mm");
};

export let formatDate = (input: string, timeOffset: number) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeOffset).format("YYYY-MM-DD");
};

export let repeatOptions = [
  { label: t("Minutes"), value: "minutely", name: "time_unit" },
  { label: t("Hours"), value: "hourly", name: "time_unit" },
  { label: t("Days"), value: "daily", name: "time_unit" },
  { label: t("Weeks"), value: "weekly", name: "time_unit" },
  { label: t("Months"), value: "monthly", name: "time_unit" },
  { label: t("Years"), value: "yearly", name: "time_unit" }
];

const handleTime = (e: React.SyntheticEvent<HTMLInputElement>, currentISO: string) => {
  const incomingTime = e.currentTarget.value.split(":");
  const hours = parseInt(incomingTime[0]) || 0;
  const minutes = parseInt(incomingTime[1]) || 0;

  switch (e.currentTarget.name) {
    case "start_time":
      // Put the current ISO established by the date field into a var
      const currentStartISO = new Date((currentISO || "").toString())
        .toISOString();

      // Set the time of the already existing iso string
      const newStartISO = moment(currentStartISO)
        .set("hours", hours)
        .set("minutes", minutes)
        .toISOString();

      return newStartISO;

    case "end_time":
      const currentEndISO = new Date((currentISO || "").toString())
        .toISOString();

      const newEndISO = moment(currentEndISO)
        .set("hours", hours)
        .set("minutes", minutes)
        .toISOString();

      return newEndISO;

    default:
      throw new Error("Expected a name attribute from time field.");
  }
};

const addExecutables =
  (resource: (TaggedSequence | TaggedRegimen)[]): DropDownItem[] => {
    const d: DropDownItem[] = [];
    resource.map(r => {
      if (r.body.id) {
        d.push({ label: r.body.name, headingId: r.kind, value: r.body.id });
      }
    });
    return d;
  };

export function mapStateToPropsAddEdit(props: Everything): AddEditFarmEventProps {
  const executableList: DropDownItem[] = [
    { label: t("Sequences"), heading: true, value: 0, headingId: "Sequence" },
    ...addExecutables(selectAllSequences(props.resources.index)),
    { label: t("Regimens"), heading: true, value: 0, headingId: "Regimen" },
    ...addExecutables(selectAllRegimens(props.resources.index)),
  ];

  const regimensById = indexRegimenById(props.resources.index);
  const sequencesById = indexSequenceById(props.resources.index);
  const farmEventsById = indexFarmEventById(props.resources.index);
  const farmEvents = selectAllFarmEvents(props.resources.index);

  const getFarmEvent = (): TaggedFarmEvent | undefined => {
    const id = parseInt(getPathArray()[4]);
    if (id && hasId(props.resources.index, "FarmEvent", id)) {
      return findFarmEventById(props.resources.index, id);
    } else {
      history.push("/app/designer/farm_events");
    }
  };

  const findExecutable = (kind: ExecutableType, id: number):
    TaggedSequence | TaggedRegimen => {
    switch (kind) {
      case "Sequence": return findSequenceById(props.resources.index, id);
      case "Regimen": return findRegimenById(props.resources.index, id);
      default: throw new Error("GOT A BAD `KIND` STRING");
    }
  };
  const dev = getDeviceAccountSettings(props.resources.index);

  const { configuration } = props.bot.hardware;
  const fbosConfig = validFbosConfig(getFbosConfig(props.resources.index));
  const autoSyncEnabled =
    !!sourceFbosConfigValue(fbosConfig, configuration)("auto_sync").value;

  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const allowRegimenBackscheduling = shouldDisplay(
    installedOsVersion, props.bot.minOsFeatureData)(
      Feature.backscheduled_regimens);

  return {
    deviceTimezone: dev
      .body
      .timezone,
    dispatch: props.dispatch,
    regimensById,
    sequencesById,
    farmEventsById,
    executableOptions: executableList,
    repeatOptions,
    handleTime,
    farmEvents,
    getFarmEvent,
    findExecutable,
    timeOffset: dev.body.tz_offset_hrs,
    autoSyncEnabled,
    allowRegimenBackscheduling,
  };
}
