import * as React from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { t } from "i18next";
import { Row } from "../../ui";
import { mapStateToProps } from "./map_state_to_props";
import { FarmEventProps, CalendarOccurrence } from "../interfaces";
import * as _ from "lodash";
import * as moment from "moment";

export class PureFarmEvents extends React.Component<FarmEventProps, {}> {
  innerRows = (items: CalendarOccurrence[]) => {

    return _(items)
      .sortBy(x => x.sortKey)
      .value()
      .map((farmEvent, index) => {
        let url = `/app/designer/farm_events/` + (farmEvent.id || "UNSAVED_EVENT").toString();
        let heading: string;
        let subHeading: JSX.Element;

        if (farmEvent.subheading) {
          heading = farmEvent.subheading;
          subHeading = <p style={{ color: "gray" }}>
            {farmEvent.heading}
          </p>;
        } else {
          heading = farmEvent.heading;
          subHeading = <p />;
        }

        return (
          <div
            className="farm-event-data-block"
            key={`${farmEvent.sortKey}.${index}`}>
            <div className="farm-event-data-time">
              {farmEvent.timeStr}
            </div>
            <div className="farm-event-data-executable">
              {heading}
              {subHeading}
            </div>
            <Link to={url}>
              <i className="fa fa-pencil-square-o edit-icon" />
            </Link>
          </div>
        );
      });
  }

  renderCalendarRowsInYear(year: number) {
    return this.props.calendarRows.filter((day) => {
      return day.year == year;
    }).map(item => {
      return (
        <div className="farm-event" key={item.sortKey}>
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
        </div>
      );
    });
  }

  renderCalendarRows() {
    let years = _.uniq(_.map(this.props.calendarRows, "year"));
    return years.map(year => {
      return (
        <div key={moment(year, "YY").unix()}>
          <div className="farm-event-year">
            20{year}
          </div>
          {this.renderCalendarRowsInYear(year)}
        </div>);
    });
  }

  render() {
    return (
      <div className="panel-container magenta-panel farm-event-panel">
        <div className="panel-header magenta-panel">
          <div className="panel-tabs">
            <Link to="/app/designer" className="visible-xs">
              {t("Designer")}
            </Link>
            <Link to="/app/designer/plants">
              {t("Plants")}
            </Link>
            <Link to="/app/designer/farm_events" className="active">
              {t("Farm Events")}
            </Link>
          </div>
        </div>

        <div className="panel-content">
          <Row>
            {/* Hidden until built out per Rory */}
            {/*
            <Col xs={2}>
              <i className="fa fa-calendar"></i>
            </Col>

            <Col xs={10}>
              <FBSelect list={[]}
                selectedItem={undefined}
                onChange={option => {
                  this.props.push("/app/designer/farm_events/" + option.value);
                }}
              />
            </Col>
            */}
          </Row>

          <div className="farm-events">
            {this.renderCalendarRows()}
          </div>

          <Link to="/app/designer/farm_events/add">
            <button className="plus-button fb-button magenta">
              <i className="fa fa-2x fa-plus" />
            </button>
          </Link>
        </div>
      </div>
    );
  }
}

/** This is intentional. It is not a hack or a work around.
 * It greatly simplifies unit testing.
 * See testing pattern noted here: https://github.com/airbnb/enzyme/issues/98
 */
export let FarmEvents = connect(mapStateToProps)(PureFarmEvents);
