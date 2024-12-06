import React from "react";
import { FBSelect, Row, BlurableInput } from "../../ui";
import moment from "moment";
import { TaggedSensorReading } from "farmbot";
import { TimePeriodSelectionProps, DateDisplayProps } from "./interfaces";
import { cloneDeep } from "lodash";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";

/** Look up time period label by seconds. */
const timePeriodLookup = () => ({
  [60 * 60 * 24]: t("Day"),
  [60 * 60 * 24 * 7]: t("Week"),
  [60 * 60 * 24 * 30]: t("Month"),
  [60 * 60 * 24 * 365]: t("Year"),
});

/** For time period selection dropdown. */
const timePeriodList = () => Object.entries(timePeriodLookup())
  .map(([value, label]) => ({ value, label }));

const blurableInputDateFormat = "YYYY-MM-DD";

const today = moment().startOf("day").unix();

/** Return default time period end date sensor readings widget state. */
export const getEndDate = (sensorReadings: TaggedSensorReading[]) =>
  sensorReadings.length > 0
    ? moment(cloneDeep(sensorReadings).reverse()[0]
      .body.read_at).startOf("day").unix()
    : today;

/** Specify a time period by end date and duration. */
export const TimePeriodSelection = (props: TimePeriodSelectionProps) => {
  const { timePeriod, endDate, showPreviousPeriod,
    setEndDate, setPeriod, togglePrevious } = props;
  return <div className="sensor-history-time-selection">
    <Row className="grid-3-col">
      <label>{t("Time period")}</label>
      <div className="row">
        <label style={{ display: "inline" }}>{t("Period End Date")}</label>
        <i className={"fa fa-clock-o fb-icon-button invert"}
          onClick={() => setEndDate(today)} />
      </div>
      <label>{t("Show Previous Period")}</label>
    </Row>
    <Row className="grid-3-col">
      <FBSelect
        key={timePeriod}
        selectedItem={
          { label: timePeriodLookup()[timePeriod], value: timePeriod }}
        onChange={ddi => setPeriod(parseInt("" + ddi.value))}
        list={timePeriodList()} />
      <BlurableInput
        type="date"
        value={moment.unix(endDate).format(blurableInputDateFormat)}
        onCommit={e => setEndDate(moment(e.currentTarget.value,
          blurableInputDateFormat).unix())} />
      <div className="fb-checkbox large">
        <input type="checkbox"
          name="previous"
          checked={showPreviousPeriod}
          onChange={togglePrevious} />
      </div>
    </Row>
  </div>;
};

/** Format date for widget footer display. */
const formatFooterDate = (unix: number, timeSettings: TimeSettings) =>
  moment.unix(unix).utcOffset(timeSettings.utcOffset).format("MMMM D");

/** Display sensor reading date filter settings. */
export const DateDisplay = (props: DateDisplayProps) => {
  const { endDate, timeSettings, timePeriod, showPreviousPeriod } = props;
  const dateRange = (end: number) => {
    const begin = formatFooterDate(end - timePeriod, timeSettings);
    return timePeriod > 60 * 60 * 24
      ? `${begin}–${formatFooterDate(end, timeSettings)}`
      : formatFooterDate(end, timeSettings);
  };
  return <div className="date">
    <label>{t("Date")}:</label>
    <span>
      {dateRange(endDate)}
    </span>
    {showPreviousPeriod &&
      <span style={{ color: "gray" }}>
        {" (" + dateRange(endDate - timePeriod) + ")"}
      </span>}
  </div>;
};
