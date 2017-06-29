import { Everything } from "../interfaces";
import { Props, RegimenItem, RegimenItemCalendarRow, CalendarRow } from "./interfaces";
import {
  selectAllSequences,
  selectAllRegimens,
  maybeGetSequence,
  maybeGetRegimen,
  findId,
  findSequence
} from "../resources/selectors";
import { TaggedRegimen } from "../resources/tagged_resources";
import { duration } from "moment";
import * as moment from "moment";
import { ResourceIndex } from "../resources/interfaces";
import { randomColor } from "../util";

export function mapStateToProps(props: Everything): Props {
  let { resources, dispatch, bot } = props;
  let { weeks, dailyOffsetMs, selectedSequenceUUID, currentRegimen } =
    resources.consumers.regimens;
  let { index } = resources;
  let current = maybeGetRegimen(index, currentRegimen);
  let calendar = current ?
    generateCalendar(current, index, dispatch) : [];

  return {
    dispatch: props.dispatch,
    sequences: selectAllSequences(index),
    resources: index,
    auth: props.auth,
    current,
    regimens: selectAllRegimens(index),
    selectedSequence: maybeGetSequence(index, selectedSequenceUUID),
    dailyOffsetMs,
    weeks,
    bot,
    calendar
  };
}

/** Formatting of calendar row dates. */
const FMT = "h:mm a";
const SORT_KEY: keyof RegimenItemCalendarRow = "sortKey";

/** Does all the heavy lifting related to joining regimen items with their
 * appropriate sequence meta data like "sequence name" and the like.
 */
function generateCalendar(regimen: TaggedRegimen,
  index: ResourceIndex,
  dispatch: Function): CalendarRow[] {
  let mapper = createRows(index, dispatch, regimen);
  let rows = regimen.body.regimen_items.map(mapper);
  let dict = _.groupBy(rows, "day");
  let makeRows = (day: string): CalendarRow => ({ day: day, items: dict[day] });
  let days = _(dict)
    .keys()
    .map(x => parseInt(x))
    .sort((a, b) => a - b)
    .map(x => "" + x)
    .value();
  return days
    .map(makeRows)
    .map((x) => {
      x.items = _(x.items).sortBy(SORT_KEY).value();
      return x;
    });
}

let createRows = (index: ResourceIndex, dispatch: Function, regimen: TaggedRegimen) =>
  (item: RegimenItem): RegimenItemCalendarRow => {
    let uuid = findId(index, "sequences", item.sequence_id);
    let sequence = findSequence(index, uuid);
    let { time_offset } = item;
    let d = duration(time_offset);
    let { name } = sequence.body;
    let color = sequence.body.color || randomColor()
    let hhmm = moment({ hour: d.hours(), minute: d.minutes() }).format(FMT);
    let day = Math.floor(duration(time_offset).asDays()) + 1;
    return { name, hhmm, color, day, dispatch, regimen, item, sortKey: time_offset };
  }

