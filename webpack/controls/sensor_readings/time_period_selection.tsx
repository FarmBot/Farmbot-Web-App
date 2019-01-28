import * as React from "react";
import { FBSelect, Row, Col, BlurableInput } from "../../ui";
import { t } from "i18next";
import moment from "moment";
import { TaggedSensorReading } from "farmbot";
import { TimePeriodSelectionProps, DateDisplayProps } from "./interfaces";
import { cloneDeep } from "lodash";

/** Look up time period label by seconds. */
const timePeriodLookup = {
  [60 * 60 * 24]: t("Day"),
  [60 * 60 * 24 * 7]: t("Week"),
  [60 * 60 * 24 * 30]: t("Month"),
  [60 * 60 * 24 * 365]: t("Year"),
};

/** For time period selection dropdown. */
const timePeriodList = Object.entries(timePeriodLookup)
  .map(([value, label]) => ({ value, label }));

const blurableInputDateFormat = "YYYY-MM-DD";

const today = moment().startOf("day").unix();

/** Return default time period end date sensor readings widget state. */
export const getEndDate = (sensorReadings: TaggedSensorReading[]) =>
  sensorReadings.length > 0
    ? moment(cloneDeep(sensorReadings).reverse()[0]
      .body.created_at).startOf("day").unix()
    : today;

/** Specify a time period by end date and duration. */
export const TimePeriodSelection = (props: TimePeriodSelectionProps) => {
  const { timePeriod, endDate, showPreviousPeriod,
    setEndDate, setPeriod, togglePrevious } = props;
  return <div>
    <label>{t("Time period")}</label>
    <FBSelect
      key={timePeriod}
      selectedItem={
        { label: timePeriodLookup[timePeriod], value: timePeriod }}
      onChange={ddi => setPeriod(parseInt("" + ddi.value))}
      list={timePeriodList} />
    <Row>
      <Col xs={6}>
        <label>{t("Period End Date")}</label>
        <i className="fa fa-clock-o"
          style={{ marginLeft: "1rem" }}
          onClick={() => setEndDate(today)} />
        <BlurableInput
          type="date"
          value={moment.unix(endDate).format(blurableInputDateFormat)}
          onCommit={e => setEndDate(moment(e.currentTarget.value,
            blurableInputDateFormat).unix())} />
      </Col>
      <Col xs={6}>
        <label>{t("Show Previous Period")}</label>
        <div className="fb-checkbox large">
          <input type="checkbox"
            checked={showPreviousPeriod}
            onChange={togglePrevious} />
        </div>
      </Col>
    </Row>
  </div>;
};

/** Format date for widget footer display. */
const formatDate = (unix: number, offset: number) =>
  moment.unix(unix).utcOffset(offset).format("MMMM D");

/** Display sensor reading date filter settings. */
export const DateDisplay = (props: DateDisplayProps) => {
  const { endDate, timeOffset, timePeriod, showPreviousPeriod } = props;
  const dateRange = (end: number) => {
    const begin = formatDate(end - timePeriod, timeOffset);
    return timePeriod > 60 * 60 * 24
      ? `${begin}–${formatDate(end, timeOffset)}`
      : formatDate(end, timeOffset);
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
