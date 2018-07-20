import * as React from "react";
import { FBSelect, Row, Col, BlurableInput } from "../../ui";
import { t } from "i18next";
import * as moment from "moment";
import { TaggedSensorReading } from "../../resources/tagged_resources";

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

/** Return default time period end date sensor readings widget state. */
export const getEndDate = (sensorReadings: TaggedSensorReading[]) =>
  sensorReadings.length > 0
    ? moment(sensorReadings.reverse()[0].body.created_at).unix()
    : moment().unix();

/** Specify a time period by end date and duration. */
export const TimePeriodSelection =
  ({ timePeriod, endDate, showPreviousPeriod,
    setEndDate, setPeriod, togglePrevious }: {
      timePeriod: number,
      endDate: number,
      showPreviousPeriod: boolean,
      setEndDate: (date: number) => void,
      setPeriod: (period: number) => void,
      togglePrevious: (event: React.ChangeEvent<HTMLInputElement>) => void
    }) =>
    <div>
      <label>{t("Time period")}</label>
      <FBSelect
        selectedItem={
          { label: timePeriodLookup[timePeriod], value: timePeriod }}
        onChange={ddi => setPeriod(parseInt("" + ddi.value))}
        list={timePeriodList} />
      <Row>
        <Col xs={6}>
          <label>{t("Period End Date")}</label>
          <i className="fa fa-clock-o"
            style={{ marginLeft: "1rem" }}
            onClick={() => setEndDate(moment().unix())} />
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

/** Format date for widget footer display. */
const formatDate = (unix: number, offset: number) =>
  moment.unix(unix).utcOffset(offset).format("MMMM D");

/** Display sensor reading date filter settings. */
export const DateDisplay =
  ({ endDate, timeOffset, timePeriod, showPreviousPeriod }: {
    endDate: number,
    timeOffset: number,
    timePeriod: number,
    showPreviousPeriod: boolean,
  }) => {
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
