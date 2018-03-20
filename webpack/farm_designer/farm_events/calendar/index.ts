import { Dictionary } from "farmbot/dist";
import { CalendarOccurrence, CalendarDay } from "../../interfaces";
import * as moment from "moment";
import * as _ from "lodash";

export class Calendar {
  /** We sort by this attribute. Left as const so that the comiler can catch
   * name changes. */
  static SORT_KEY: keyof CalendarDay = "sortKey";
  static DATE_FORMAT = "MMDDYY";
  static MONTHS: Readonly<Dictionary<string>> = {
    "12": "Dec",
    "11": "Nov",
    "10": "Oct",
    "09": "Sep",
    "08": "Aug",
    "07": "Jul",
    "06": "Jun",
    "05": "May",
    "04": "Apr",
    "03": "Mar",
    "02": "Feb",
    "01": "Jan"
  };

  constructor(public value: Dictionary<CalendarOccurrence[]> = {}) { }

  insert(occur: CalendarOccurrence) {
    const k = occur.mmddyy;
    this.value[k] = this.value[k] || [];
    this.value[k].push(occur);
  }

  getAll(): CalendarDay[] {
    const all = Object
      .keys(this.value)
      .map(x => this.value[x])
      .filter(x => !!x)        // Poor man's compact() function.
      .filter(x => !!x.length) // Don't bother rendering empty days.
      .map((items): CalendarDay => {
        const item = items[0];
        return {
          sortKey: item.sortKey,
          year: parseInt(item.mmddyy.slice(4, 6)),
          month: Calendar.MONTHS[item.mmddyy.slice(0, 2)] || "???",
          day: parseInt(item.mmddyy.slice(2, 4)),
          items: _.sortBy(items, Calendar.SORT_KEY)
        };
      });
    return _(all).sortBy(Calendar.SORT_KEY).value();
  }

  findByDate(m: moment.Moment): CalendarOccurrence[] {
    return this.value[this.fmtDate(m)] || [];
  }

  fmtDate = (m: moment.Moment) => {
    return m.format(Calendar.DATE_FORMAT);
  }
}
