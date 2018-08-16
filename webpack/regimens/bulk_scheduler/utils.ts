import { TaggedSequence } from "farmbot";
import { isParameterized } from "../../sequences/is_parameterized";
import { error } from "farmbot-toastr";
import { t } from "i18next";
import * as moment from "moment";
import * as _ from "lodash";
import { Content } from "../../constants";

export function maybeWarnAboutParameters(s: undefined | TaggedSequence) {
  s && isParameterized(s.body) && error(t(Content.NO_PARAMETERS));
}

export function msToTime(ms: number) {
  if (_.isNumber(ms)) {
    const d = moment.duration(ms);
    const h = _.padStart(d.hours().toString(), 2, "0");
    const m = _.padStart(d.minutes().toString(), 2, "0");
    return `${h}:${m}`;
  } else {
    return "00:01";
  }
}

export function timeToMs(input: string) {
  const [hours, minutes] = input
    .split(":")
    .map((n: string) => parseInt(n, 10));
  return ((hours * 60) + (minutes)) * 60 * 1000;
}
