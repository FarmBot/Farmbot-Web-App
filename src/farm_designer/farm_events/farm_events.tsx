import * as React from "react";
import { Link } from "react-router";
import { connect } from "react-redux";
import { t } from "i18next";

import { DeprecatedFBSelect, Row, Col } from "../../ui";
import { mapStateToProps } from "./map_state_to_props";
import { FarmEventProps } from "../interfaces";

@connect(mapStateToProps)
export class FarmEvents extends React.Component<FarmEventProps, {}> {
  private renderCalendarRows() {
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
            {item.items.map((farmEvent, index) => {

              let url = `/app/designer/farm_events/` +
                (farmEvent.id || "UNSAVED_EVENT").toString();
              let displayNameFields = farmEvent.displayName.split('\n');
              let regimenName = null;
              if (displayNameFields.length > 1) {
                regimenName = <p style={{color:'gray'}}>{displayNameFields[0]}</p>;
              } else {
                regimenName = displayNameFields[0]
              }

              return (
                <div
                  className="farm-event-data-block"
                  key={`${farmEvent.sortKey}.${index}`}
                >
                  <div className="farm-event-data-time">
                    {farmEvent.timeStr}
                  </div>
                  <div className="farm-event-data-executable">
                    {displayNameFields[1]}
                    {regimenName}
                  </div>
                  <Link to={url}>
                    <i className="fa fa-pencil-square-o edit-icon" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  }

  public render() {
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
              <DeprecatedFBSelect list={[]}
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
