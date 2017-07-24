import * as React from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { t } from "i18next";
import { Row, Col } from "../../ui";
import { mapStateToProps } from "./map_state_to_props";
import { FarmEventProps, CalendarOccurrence } from "../interfaces";
import { FBSelect } from "../../ui/new_fb_select";
import * as _ from "lodash";

/** GIVEN: A string, formatted as `hh:mmaa`.
 *  RETURNS: The number of minutes, from midnight of that string.
 *  EXAMPLE: 02:05pm returns 845 (since 14:05 is 845 minutes from midnight).
 */
export function stringToMinutes(hhmmaa: string): number {
  if (!!hhmmaa.match(/[0-9][0-9]:[0-9][0-9](am|pm)/)) {
    let h = parseInt(hhmmaa.slice(0, 2)) * 60;
    let m = parseInt(hhmmaa.slice(3, 5));
    let a = hhmmaa[5] === "p" ? (12 * 60) : 0;
    return h + m + a;
  } else {
    throw new Error("Bad calendar item string format.");
  }
}

export class PureFarmEvents extends React.Component<FarmEventProps, {}> {
  innerRows = (items: CalendarOccurrence[]) => {
    let SORT_KEY: keyof typeof items[0] = "sortKey";

    return _(items)
      .sortBy(x => stringToMinutes(x.timeStr))
      .value()
      .map((farmEvent, index) => {
        console.log(farmEvent.sortKey);
        let url = `/app/designer/farm_events/` + (farmEvent.id || "UNSAVED_EVENT").toString();
        let heading: string;
        let subHeading: JSX.Element;

        if (farmEvent.childExecutableName) {
          heading = farmEvent.childExecutableName;
          subHeading = <p style={{ color: "gray" }}>
            {farmEvent.parentExecutableName}
          </p>;
        } else {
          heading = farmEvent.parentExecutableName;
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

  renderCalendarRows() {
    return this.props.calendarRows.map(item => {
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
