import { Everything, TimeSettings } from "../interfaces";
import {
  Props, RegimenItem, RegimenItemCalendarRow, CalendarRow
} from "./interfaces";
import {
  selectAllSequences,
  selectAllRegimens,
  maybeGetSequence,
  maybeGetRegimen,
  findId,
  findSequence,
  maybeGetDevice,
  findSequenceById,
  maybeGetTimeSettings
} from "../resources/selectors";
import { TaggedRegimen, TaggedSequence } from "farmbot";
import moment from "moment";
import { ResourceIndex, UUID, VariableNameSet } from "../resources/interfaces";
import {
  randomColor, determineInstalledOsVersion,
  createShouldDisplayFn as shouldDisplayFunc,
  timeFormatString
} from "../util";
import { resourceUsageList } from "../resources/in_use";
import { groupBy, chain, sortBy } from "lodash";
import { DevSettings } from "../account/dev/dev_support";

export function mapStateToProps(props: Everything): Props {
  const { resources, dispatch, bot } = props;
  const {
    weeks, dailyOffsetMs, selectedSequenceUUID, currentRegimen, schedulerOpen
  } = resources.consumers.regimens;
  const { index } = resources;
  const current = maybeGetRegimen(index, currentRegimen);
  const timeSettings = maybeGetTimeSettings(props.resources.index);
  const calendar = current ?
    generateCalendar(current, index, dispatch, timeSettings) : [];

  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const fbosVersionOverride = DevSettings.overriddenFbosVersion();
  const shouldDisplay = shouldDisplayFunc(
    installedOsVersion, props.bot.minOsFeatureData, fbosVersionOverride);

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
    dispatch: props.dispatch,
    sequences: selectAllSequences(index),
    variableData,
    resources: index,
    auth: props.auth,
    current,
    regimens: selectAllRegimens(index),
    selectedSequence: maybeGetSequence(index, selectedSequenceUUID),
    dailyOffsetMs,
    weeks,
    bot,
    calendar,
    regimenUsageStats: resourceUsageList(props.resources.index.inUse),
    shouldDisplay,
    schedulerOpen,
  };
}

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
  timeSettings: TimeSettings
) =>
  (item: RegimenItem): RegimenItemCalendarRow => {
    const uuid = findId(index, "Sequence", item.sequence_id);
    const sequence = findSequence(index, uuid);
    const variable = getParameterLabel(sequence);
    const { time_offset } = item;
    const d = moment.duration(time_offset);
    const { name } = sequence.body;
    const color = sequence.body.color || randomColor();
    const FORMAT = timeFormatString(timeSettings);
    const hhmm = moment({ hour: d.hours(), minute: d.minutes() }).format(FORMAT);
    const day = Math.floor(moment.duration(time_offset).asDays()) + 1;
    return {
      name, hhmm, color, day, dispatch, regimen, item, variable,
      sortKey: time_offset
    };
  };

const getParameterLabel = (sequence: TaggedSequence): string | undefined =>
  (sequence.body.args.locals.body || [])
    .filter(variable => variable.kind === "parameter_declaration")
    .map(variable => variable.args.label)[0];
