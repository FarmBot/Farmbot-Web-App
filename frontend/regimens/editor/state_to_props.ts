import { Everything, TimeSettings } from "../../interfaces";
import { RegimenItemCalendarRow, CalendarRow } from "../interfaces";
import {
  maybeGetRegimen,
  findUuid,
  findSequence,
  findSequenceById,
  maybeGetTimeSettings,
} from "../../resources/selectors";
import { TaggedRegimen, TaggedSequence } from "farmbot";
import moment from "moment";
import { ResourceIndex, UUID, VariableNameSet } from "../../resources/interfaces";
import { timeFormatString } from "../../util";
import { groupBy, chain, sortBy } from "lodash";
import { RegimenEditorProps } from "./interfaces";
import { RegimenItem } from "farmbot/dist/resources/api_resources";

export const mapStateToProps = (props: Everything): RegimenEditorProps => {
  const { dispatch } = props;
  const { currentRegimen } = props.resources.consumers.regimens;
  const current = maybeGetRegimen(props.resources.index, currentRegimen);
  const timeSettings = maybeGetTimeSettings(props.resources.index);
  const calendar = current
    ? generateCalendar(current, props.resources.index, dispatch, timeSettings)
    : [];

  const calledSequences = (): UUID[] => {
    if (current) {
      const sequenceIds = current.body.regimen_items.map(x => x.sequence_id);
      return Array.from(new Set(sequenceIds)).map(x =>
        findSequenceById(props.resources.index, x).uuid);
    }
    return [];
  };

  const variableData: VariableNameSet = {};
  calledSequences().map(uuid =>
    Object.entries(props.resources.index.sequenceMetas[uuid] || {})
      .map(([key, value]) => !variableData[key] && (variableData[key] = value)));

  return {
    dispatch,
    variableData,
    resources: props.resources.index,
    current,
    calendar,
  };
};

const SORT_KEY: keyof RegimenItemCalendarRow = "sortKey";

/** Does all the heavy lifting related to joining regimen items with their
 * appropriate sequence meta data like "sequence name" and the like.
 */
function generateCalendar(regimen: TaggedRegimen,
  index: ResourceIndex,
  dispatch: Function,
  timeSettings: TimeSettings): CalendarRow[] {
  const mapper = createRows(index, dispatch, regimen, timeSettings);
  const rows = regimen.body.regimen_items.map(mapper);
  const dict = groupBy(rows, "day");
  const makeRows = (day: string): CalendarRow => ({ day: day, items: dict[day] });
  const days = chain(dict)
    .keys()
    .map(x => parseInt(x))
    .sort((a, b) => a - b)
    .map(x => "" + x)
    .value();
  return days
    .map(makeRows)
    .map((x) => {
      x.items = sortBy(x.items, SORT_KEY);
      return x;
    });
}

const createRows = (
  index: ResourceIndex, dispatch: Function, regimen: TaggedRegimen,
  timeSettings: TimeSettings,
) =>
  (item: RegimenItem): RegimenItemCalendarRow => {
    const uuid = findUuid(index, "Sequence", item.sequence_id);
    const sequence = findSequence(index, uuid);
    const variables = getParameterLabels(sequence);
    const { time_offset } = item;
    const d = moment.duration(time_offset);
    const sequenceName = sequence.body.name;
    const color = sequence.body.color;
    const FORMAT = timeFormatString(timeSettings);
    const hhmm = moment({ hour: d.hours(), minute: d.minutes() }).format(FORMAT);
    const day = Math.floor(moment.duration(time_offset).asDays()) + 1;
    return {
      sequenceName, hhmm, color, day, dispatch, regimen, item, variables,
      sortKey: time_offset
    };
  };

const getParameterLabels = (sequence: TaggedSequence): (string | undefined)[] =>
  (sequence.body.args.locals.body || [])
    .filter(variable => variable.kind === "parameter_declaration")
    .map(variable => variable.args.label);
