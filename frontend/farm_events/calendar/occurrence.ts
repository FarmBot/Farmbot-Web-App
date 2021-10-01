import moment from "moment";
import { CalendarOccurrence } from "../../farm_designer/interfaces";
import { FarmEventWithExecutable } from "./interfaces";
import { Calendar } from "./index";
import { TimeSettings } from "../../interfaces";
import { betterCompact, formatTime } from "../../util";
import { reduceVariables } from "../../sequences/locals_list/variable_support";
import { determineDropdown, withPrefix } from "../../resources/sequence_meta";
import { ResourceIndex } from "../../resources/interfaces";
import { convertFormVariable } from "../../sequences/locals_list/locals_list";
import { ParameterDeclaration } from "farmbot";

/** An occurrence is a single event on the calendar, usually rendered as a
 * little white square on the farm event UI. This is the data representation for
 * single calendar entries. */
export function occurrence(
  m: moment.Moment,
  fe: FarmEventWithExecutable,
  timeSettings: TimeSettings,
  resources: ResourceIndex,
  modifiers?: { numHidden?: number, empty?: boolean }):
  CalendarOccurrence {
  const normalHeading = fe.executable.name || fe.executable_type;
  const heading = () => {
    if (modifiers?.empty) {
      return "*Empty*";
    }
    if (modifiers?.numHidden) {
      return `+ ${modifiers.numHidden} more: ` + normalHeading;
    }
    return normalHeading;
  };
  const { utcOffset } = timeSettings;
  return {
    mmddyy: m.utcOffset(utcOffset).format(Calendar.DATE_FORMAT),
    sortKey: m.unix(),
    timeStr: formatTime(m.clone(), timeSettings),
    heading: heading(),
    variables: getVariableLabels(resources, fe),
    executableId: fe.executable_id || 0,
    executableType: fe.executable_type,
    id: fe.id || 0,
    color: fe.executable.color,
  };
}

/** Generate a list of variable descriptions with default value fallbacks. */
const getVariableLabels = (
  resources: ResourceIndex,
  fe: FarmEventWithExecutable,
) => {
  const bodyVariables = fe.body ? reduceVariables(fe.body) : {};
  const resourceVariables = fe.executable_type == "Sequence"
    ? fe.executable.args.locals.body
    : fe.executable.body;
  const variableLabels = (resourceVariables || [])
    .filter(variable => variable.kind === "parameter_declaration")
    .map((variable: ParameterDeclaration) =>
      withPrefix(variable.args.label,
        bodyVariables[variable.args.label]
          ? determineDropdown(bodyVariables[variable.args.label], resources).label
          : convertFormVariable(variable, resources).dropdown.label));
  return betterCompact(variableLabels).sort();
};
