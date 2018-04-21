import * as React from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { t } from "i18next";
import { Row } from "../../ui/index";
import { mapStateToProps } from "./map_state_to_props";
import { FarmEventProps, CalendarOccurrence } from "../interfaces";
import * as _ from "lodash";
import * as moment from "moment";
import { Content } from "../../constants";

export class PureFarmEvents extends React.Component<FarmEventProps, {}> {
  innerRows = (items: CalendarOccurrence[]) => {

    return _(items)
      .sortBy(x => x.sortKey)
      .value()
      .map((occur, index) => {
        const url = `/app/designer/farm_events/`
          + (occur.id || "UNSAVED_EVENT").toString();
        const heading = occur.subheading
          ? occur.subheading
          : occur.heading;
        const subHeading = occur.subheading
          ? <p style={{ color: "gray" }}> {occur.heading} </p>
          : <p />;

        return <div
          className="farm-event-data-block"
          key={`${occur.sortKey}.${index}`}>
          <div className="farm-event-data-time">
            {occur.timeStr}
          </div>
          <div className="farm-event-data-executable">
            {heading}
            {subHeading}
          </div>
          <Link to={url}>
            <i className="fa fa-pencil-square-o edit-icon" />
          </Link>
        </div>;
      });
  }

  renderCalendarRowsInYear(year: number) {
    return this.props.calendarRows.filter((day) => {
      return day.year == year;
    }).map(item => {
      return <div className="farm-event" key={item.sortKey}>
        <div className="farm-event-date">
          <div className="farm-event-date-month">
            {item.month}
          </div>
          <div className="farm-event-date-day">
            <b>{item.day}</b>
          </div>
        </div>
        <div className="farm-event-data">
          {this.innerRows(item.items)}
        </div>
      </div>;
    });
  }

  renderCalendarRows() {
    const years = _.uniq(_.map(this.props.calendarRows, "year"));
    return years.map(year => {
      return <div key={moment(year, "YY").unix()}>
        <div className="farm-event-year">
          20{year}
        </div>
        {this.renderCalendarRowsInYear(year)}
      </div>;
    });
  }

  /** FarmEvents will generate some very unexpected results if the user has
   * not set a timezone for the bot (defaults to 0 UTC offset, which could be
   * far from user's local time). */
  tzwarning = () => {
    return <div className="panel-content">
      <Row>
      </Row>

      <div className="farm-events">
        <h2>Timezone Required</h2>
        <p>
          {t(Content.SET_TIMEZONE_HEADER)}
        </p>
        <p>
          <Link to="/app/device">{t(Content.SET_TIMEZONE_BODY)}</Link>
        </p>
      </div>
    </div>;
  };

  normalContent = () => {
    return <div className="panel-content">
      <Row>
      </Row>

      <div className="farm-events">
        {this.renderCalendarRows()}
      </div>

      <Link to="/app/designer/farm_events/add">
        <button className="plus-button fb-button magenta">
          <i className="fa fa-2x fa-plus" />
        </button>
      </Link>
    </div>;
  };

  render() {

    return <div className="panel-container magenta-panel farm-event-panel">
      {this.props.timezoneIsSet ? this.normalContent() : this.tzwarning()}
    </div>;
  }
}

/** This is intentional. It is not a hack or a work around.
 * It greatly simplifies unit testing.
 * See testing pattern noted here: https://github.com/airbnb/enzyme/issues/98
 */
export let FarmEvents = connect(mapStateToProps)(PureFarmEvents);
