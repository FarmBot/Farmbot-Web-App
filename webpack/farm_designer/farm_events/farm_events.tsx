import * as React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import { Row } from "../../ui/index";
import { mapStateToProps } from "./map_state_to_props";
import {
  FarmEventProps, CalendarOccurrence, FarmEventState
} from "../interfaces";
import * as _ from "lodash";
import * as moment from "moment";
import { Content } from "../../constants";
import { DesignerNavTabs } from "../panel_header";
import { Link } from "../../link";
import { DesignerPanel, DesignerPanelContent } from "../plants/designer_panel";
import { EmptyStateWrapper, EmptyStateGraphic } from "../../ui/empty_state_wrapper";

const filterSearch = (term: string) => (item: CalendarOccurrence) =>
  item.heading.toLowerCase().includes(term)
  || (item.subheading && item.subheading.toLowerCase().includes(term));

export class PureFarmEvents
  extends React.Component<FarmEventProps, FarmEventState> {
  state: FarmEventState = { searchTerm: "" };
  get searchTerm() { return this.state.searchTerm.toLowerCase(); }

  resetCalendar = () => {
    this.setState({ searchTerm: "" });
    const panel = document.querySelector(".farm-events");
    if (panel) { panel.scrollTo(0, 0); }
  }

  innerRows = (items: CalendarOccurrence[]) => {

    return _(items)
      .sortBy(x => x.sortKey)
      .value()
      .filter(filterSearch(this.searchTerm))
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
    })
      .filter(item => !this.searchTerm ||
        _.some(item.items.map(filterSearch(this.searchTerm))))
      .map(item => {
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
    return <DesignerPanelContent panelName={"farm-event"}>
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
    </DesignerPanelContent>;
  };

  normalContent = () => {
    return <DesignerPanelContent panelName={"farm-event"}>
      <Row>
        <i className="fa fa-calendar" onClick={this.resetCalendar} />
        <input
          value={this.state.searchTerm}
          onChange={e => this.setState({ searchTerm: e.currentTarget.value })}
          placeholder={t("Search events...")} />
      </Row>

      <div className="farm-events">
        <EmptyStateWrapper
          notEmpty={this.props.calendarRows.length > 0}
          title={t("No events scheduled.")}
          text={t(Content.NOTHING_SCHEDULED)}
          colorScheme="events"
          graphic={EmptyStateGraphic.no_farm_events}>
          {this.renderCalendarRows()}
        </EmptyStateWrapper>
      </div>

      <Link to="/app/designer/farm_events/add">
        <button className="plus-button fb-button magenta">
          <i className="fa fa-2x fa-plus" />
        </button>
      </Link>
    </DesignerPanelContent>;
  };

  render() {
    return <DesignerPanel panelName={"farm-event"} panelColor={"magenta"}>
      <DesignerNavTabs />
      {this.props.timezoneIsSet ? this.normalContent() : this.tzwarning()}
    </DesignerPanel>;
  }
}

/** This is intentional. It is not a hack or a work around.
 * It greatly simplifies unit testing.
 * See testing pattern noted here: https://github.com/airbnb/enzyme/issues/98
 */
export let FarmEvents = connect(mapStateToProps)(PureFarmEvents);
