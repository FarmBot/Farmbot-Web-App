import {
  cloneDeep, first, isUndefined, last, max, range, round, sum,
} from "lodash";
import { Curve } from "farmbot/dist/resources/api_resources";
import { error } from "../toast/toast";
import { t } from "../i18next_wrapper";

/** Return the maximum day in curve data. */
export const maxDay = (data: Curve["data"]): number =>
  max(Object.keys(data).map(key => parseInt(key))) || 1;

/** Return the maximum value in curve data. */
export const maxValue = (data: Curve["data"]): number =>
  max(Object.values(data).map(value => value)) || 0;

/** Return the sum of curve data mL values in L up to the specified day. */
export const curveSum = (data: Curve["data"], day?: string | number): number =>
  round(sum(Object.entries(populatedData(data))
    .filter(([key, _val]) => parseInt(key) <= parseInt("" + (day || maxDay(data))))
    .map(([_key, val]) => val)) / 1000, 2);

/** Check if curve data includes a value for the specified day. */
export const inData = (data: Curve["data"], day: string | number) =>
  Object.keys(data).includes("" + day);

/** Check if the maximum number of control points has been reached. */
export const dataFull = (data: Curve["data"]) => Object.values(data).length > 9;

/** Add or remove sparse values from curve data. */
export const addOrRemoveItem =
  (data: Curve["data"], day: string | number, value: number): Curve["data"] => {
    const dataCopy = cloneDeep(data);
    if (inData(data, day)) {
      delete dataCopy[parseInt("" + day)];
    } else {
      if (dataFull(dataCopy)) {
        error(t("Curve already has the maximum number of control points."));
        return dataCopy;
      }
      dataCopy[parseInt("" + day)] = value;
    }
    return dataCopy;
  };

/** Generate full curve with interpolated values for each day from sparse data. */
export const populatedData =
  (data: Curve["data"], exact = false): Curve["data"] => {
    const fullData: Curve["data"] = {};
    range(1, maxDay(data) + 1).map(day => {
      fullData[day] = interpolateDay(data, day, exact);
    });
    return fullData;
  };

/** Use linear interpolation to generate a curve value for the specified day. */
export const interpolateDay =
  (data: Curve["data"], day: string | number, exact: boolean): number => {
    if (inData(data, day)) { return data[parseInt("" + day)]; }
    const ascending = Object.entries(data)
      .sort((kv0, kv1) => parseInt(kv0[0]) - parseInt(kv1[0]));
    const next = first(ascending.filter(kv =>
      parseInt(kv[0]) > parseInt("" + day)));
    const prev = last(ascending.filter(kv =>
      parseInt(kv[0]) < parseInt("" + day)));
    if (!next) { return (last(ascending) || [0, 0])[1]; }
    if (!prev) { return ascending[0][1]; }
    const thisDay = parseInt("" + day);
    const nextDay = parseInt(next[0]);
    const prevDay = parseInt(prev[0]);
    const exactValue =
      (prev[1] * (nextDay - thisDay) + next[1] * (thisDay - prevDay))
      / (nextDay - prevDay);
    return exact ? exactValue : round(exactValue);
  };

/** Scale data to the provided new maximum values. */
export const scaleData = (
  data: Curve["data"], dayInput: number, valueInput: number, startAt1 = false,
): Curve["data"] => {
  const dayScale = dayInput / maxDay(data);
  const valueScale = valueInput / maxValue(data);
  const newData: Curve["data"] = {};
  Object.entries(data).map(([key, val]) => {
    const newDay = key == "1" ? 1 : round(parseInt(key) * dayScale);
    const newValue = key == "1" && startAt1 ? 1 : round(val * valueScale);
    newData[newDay] = newValue;
  });
  if (Object.values(data).length < 2 && dayInput > 1
    && !isUndefined(newData[1])) {
    newData[dayInput] = newData[1];
  }
  return newData;
};
