import * as React from "react";
import { Link } from "react-router";
import { DeprecatedFBSelect, Row, Col } from "../../ui";
import { connect } from "react-redux";
import { t } from "i18next";
import { mapStateToProps } from "./map_state_to_props";
import { FarmEventProps } from "../interfaces";

@connect(mapStateToProps)
export class FarmEvents extends React.Component<FarmEventProps, {}> {
  renderCalendarRows() {
    return this.props.calendarRows.map(function (item) {
      return <div className="farm-event-wrapper col-xs-12" key={item.sortKey}>

        <div className="farm-event-date col-xs-2">
          <div className="farm-event-date-month">
            {item.month}
          </div>
          <div className="farm-event-date-day">
            {item.day}
          </div>
        </div>

        <div className="col-xs-10 events">
          {item.items.map(function (farmEvent, index) {
            let url = `/app/designer/farm_events/` +
              (farmEvent.id || "UNSAVED_EVENT").toString();
            return <div className={`farm-event col-xs-12`}
              key={`${farmEvent.sortKey}.${index}`}>
              <div className="event-time col-xs-4">
                {farmEvent.timeStr}
              </div>
              <div className="event-title col-xs-8">
                {farmEvent.executableName}
              </div>
              <Link to={url}>
                <i className="fa fa-pencil-square-o edit-icon"></i>
              </Link>
            </div>;
          })}
        </div>
      </div>;
    });
  }

  render() {
    return <div className="panel-container magenta-panel">
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

      <div className="panel-content events">

        <Row>
          <i className="col-xs-2 fa fa-calendar default-pointer"></i>

          <Col xs={10}>
            <DeprecatedFBSelect list={[]}
              onChange={option => {
                this.props.push("/app/designer/farm_events/" + option.value);
              }}
            />
          </Col>

          <div className="farm-events row">
            {this.renderCalendarRows()}
          </div>
        </Row>

        <Link to="/app/designer/farm_events/add">
          <button className="plus-button fb-button magenta">
            <i className="fa fa-2x fa-plus" />
          </button>
        </Link>

      </div>
    </div>;
  }
}
