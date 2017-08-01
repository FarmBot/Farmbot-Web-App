import * as moment from "moment";
import { Moment } from "moment";
import { times, last } from "lodash";

interface SchedulerProps {
  originTime: Moment;
  intervalSeconds: number;
  lowerBound: Moment;
  upperBound?: Moment;
}

export function scheduler({ originTime,
  intervalSeconds,
  lowerBound,
  upperBound }: SchedulerProps): Moment[] {

  upperBound = upperBound || moment(moment().add(1, "year"));
  // # How many items must we skip to get to the first occurence?
  let skip_intervals =
    Math.ceil((lowerBound.unix() - originTime.unix()) / intervalSeconds);
  // # At what time does the first event occur?
  let first_item = originTime
    .clone()
    .add((skip_intervals * intervalSeconds), "seconds");
  let list = [first_item];
  times(60, () => {
    let x = last(list);
    if (x) {
      let item = x.clone().add(intervalSeconds, "seconds");
      if (item.isBefore(upperBound)) {
        list.push(item);
      }
    }
  });
  return list;
}
