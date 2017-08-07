import { AddEditFarmEventProps, ExecutableType } from "../interfaces";
import { Everything } from "../../interfaces";
import * as moment from "moment";
import * as _ from "lodash";
import { t } from "i18next";
import { history } from "../../history";
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
import { DropDownItem } from "../../ui/fb_select";

export let formatTime = (input: string) => {
  let iso = new Date(input).toISOString();
  return moment(iso).format("HH:mm");
};

export let formatDate = (input: string) => {
  let iso = new Date(input).toISOString();
  return moment(iso).format("YYYY-MM-DD");
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
  let handleTime = (e: React.SyntheticEvent<HTMLInputElement>, currentISO: string) => {
    let incomingTime = e.currentTarget.value.split(":");
    let hours = parseInt(incomingTime[0]) || 0;
    let minutes = parseInt(incomingTime[1]) || 0;

    switch (e.currentTarget.name) {
      case "start_time":
        // Put the current ISO established by the date field into a var
        let currentStartISO = new Date((currentISO || "").toString())
          .toISOString();

        // Set the time of the already existing iso string
        let newStartISO = moment(currentStartISO)
          .set("hours", hours)
          .set("minutes", minutes)
          .toISOString();

        return newStartISO;

      case "end_time":
        let currentEndISO = new Date((currentISO || "").toString())
          .toISOString();

        let newEndISO = moment(currentEndISO)
          .set("hours", hours)
          .set("minutes", minutes)
          .toISOString();

        return newEndISO;

      default:
        throw new Error("Expected a name attribute from time field.");
    }
  };

  let executableOptions: DropDownItem[] = [];

  executableOptions.push({
    label: t("REGIMENS"),
    heading: true,
    value: 0,
    headingId: "Regimen"
  });

  selectAllRegimens(props.resources.index).map(regimen => {
    if (regimen.kind === "regimens" && regimen.body.id) {
      executableOptions.push({
        label: regimen.body.name,
        headingId: "Regimen",
        value: regimen.body.id
      });
    }
  });

  executableOptions.push({
    label: t("SEQUENCES"),
    heading: true,
    value: 0,
    headingId: "Sequence"
  });

  selectAllSequences(props.resources.index).map(sequence => {
    if (sequence.kind === "sequences" && sequence.body.id) {
      executableOptions.push({
        label: sequence.body.name,
        headingId: "Sequence",
        value: sequence.body.id
      });
    }
  });

  /**
   * TODO: This is a hack to allow for recursive menu rendering. Putting this
   * in one code block for containment and easier reference for once we can
   * start facorting it out and cleaning things up.
   *
   * Basically, the new system of the menu will have a tree-like structure of
   * objects. Right now, the objects are rendered in order with a
   * { heading: true } attribute, which means having to modify the interfaces,
   * have special considerations, etc. This will hopefully make it a little
   * better. I think it would be better to handle this at the source and keep
   * the ui logic less involved. -CV 8/3/2017
   * -------------------------- BEGIN -------------------------------------*/
  let newExecutableOptions = executableOptions
    .filter(x => !x.heading)
    .map(x => {
      return {
        label: `${x.headingId}: ${x.label}`,
        value: x.value,
        headingId: _.capitalize(x.headingId)
      };
    });

  let regimensById = indexRegimenById(props.resources.index);
  let sequencesById = indexSequenceById(props.resources.index);
  let farmEventsById = indexFarmEventById(props.resources.index);

  let farmEvents = selectAllFarmEvents(props.resources.index);

  let getFarmEvent = (): TaggedFarmEvent | undefined => {
    let url = history.getCurrentLocation().pathname;
    let id = parseInt(url.split("/")[4]);
    if (id && hasId(props.resources.index, "farm_events", id)) {
      return findFarmEventById(props.resources.index, id);
    } else {
      history.push("/app/designer/farm_events");
    }
  };

  let findExecutable = (kind: ExecutableType, id: number):
    TaggedSequence | TaggedRegimen => {
    switch (kind) {
      case "Sequence": return findSequenceById(props.resources.index, id);
      case "Regimen": return findRegimenById(props.resources.index, id);
      default: throw new Error("GOT A BAD `KIND` STRING");
    }
  };

  return {
    deviceTimezone: getDeviceAccountSettings(props.resources.index)
      .body
      .timezone,
    dispatch: props.dispatch,
    regimensById,
    sequencesById,
    farmEventsById,
    executableOptions: newExecutableOptions, // <-- Temp, see comment above.
    repeatOptions,
    formatDate,
    formatTime,
    handleTime,
    farmEvents,
    getFarmEvent,
    findExecutable
  };
}
