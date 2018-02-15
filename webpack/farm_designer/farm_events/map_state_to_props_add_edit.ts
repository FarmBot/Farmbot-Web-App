import { AddEditFarmEventProps, ExecutableType } from "../interfaces";
import { Everything } from "../../interfaces";
import * as moment from "moment";
import * as _ from "lodash";
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
  hasId,
  findSequenceById,
  findRegimenById,
  getDeviceAccountSettings
} from "../../resources/selectors";
import {
  TaggedFarmEvent,
  TaggedSequence,
  TaggedRegimen
} from "../../resources/tagged_resources";
import { DropDownItem } from "../../ui/index";

export let formatTime = (input: string, timeOffset: number) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeOffset).format("HH:mm");
};

export let formatDate = (input: string, timeOffset: number) => {
  const iso = new Date(input).toISOString();
  return moment(iso).utcOffset(timeOffset).format("YYYY-MM-DD");
};

export let repeatOptions = [
  { label: "Minutes", value: "minutely", name: "time_unit" },
  { label: "Hours", value: "hourly", name: "time_unit" },
  { label: "Days", value: "daily", name: "time_unit" },
  { label: "Weeks", value: "weekly", name: "time_unit" },
  { label: "Months", value: "monthly", name: "time_unit" },
  { label: "Years", value: "yearly", name: "time_unit" }
];

export function mapStateToPropsAddEdit(props: Everything): AddEditFarmEventProps {
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

  const executableOptions: DropDownItem[] = [];

  executableOptions.push({
    label: t("Regimen"),
    heading: true,
    value: 0,
    headingId: "Regimen"
  });

  selectAllRegimens(props.resources.index).map(regimen => {
    if (regimen.kind === "Regimen" && regimen.body.id) {
      executableOptions.push({
        label: regimen.body.name,
        headingId: "Regimen",
        value: regimen.body.id
      });
    }
  });

  executableOptions.push({
    label: t("Sequence"),
    heading: true,
    value: 0,
    headingId: "Sequence"
  });

  selectAllSequences(props.resources.index).map(sequence => {
    if (sequence.kind === "Sequence" && sequence.body.id) {
      executableOptions.push({
        label: sequence.body.name,
        headingId: "Sequence",
        value: sequence.body.id
      });
    }
  });

  const executableWithHeading = executableOptions
    .filter(x => !x.heading)
    .map(x => {
      return {
        label: `${x.headingId}: ${x.label}`,
        value: x.value,
        headingId: _.capitalize(x.headingId)
      };
    });

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
  return {
    deviceTimezone: dev
      .body
      .timezone,
    dispatch: props.dispatch,
    regimensById,
    sequencesById,
    farmEventsById,
    executableOptions: executableWithHeading,
    repeatOptions,
    handleTime,
    farmEvents,
    getFarmEvent,
    findExecutable,
    timeOffset: dev.body.tz_offset_hrs
  };
}
