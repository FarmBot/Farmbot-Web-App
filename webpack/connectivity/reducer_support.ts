import { ConnectionStatus } from "./interfaces";
import * as m from "moment";
import { isString, max } from "lodash";

export function maxDate(l: m.Moment, r: m.Moment): string {
  const dates = [l, r].map(y => y.toDate());
  return (max(dates) || dates[0]).toJSON();
}

export function getStatus(cs: ConnectionStatus | undefined): "up" | "down" {
  return (cs && cs.state) || "down";
}

/** USE CASE: We have numerous, possibly duplicate sources of information
 * that represent `last_saw_mq`. One came from the API and another (possibly)
 * came from the MQ directly to the browser. This function determines which of
 * the two is most relevant. It is a heuristic process that gives up when
 * unable to make a determination. */
export function computeBestTime(cs: ConnectionStatus | undefined,
  lastSawMq: string | undefined): ConnectionStatus | undefined {

  // Only use the `last_saw_mq` time if it is more recent than the local
  // timestamp.
  // don't bother guessing if info is unavailable
  const guess: ConnectionStatus = {
    at: maxDate(m(cs ? cs.at : lastSawMq), m(lastSawMq)),
    state: getStatus(cs)
  };
  return isString(lastSawMq) ? guess : cs;
}
