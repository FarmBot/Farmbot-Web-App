import * as React from "react";
import { connect } from "react-redux";
import { mapStateToProps } from "./map_state_to_props";
import {
  FarmEventProps, CalendarOccurrence, FarmEventState
} from "../interfaces";
import moment from "moment";
import { Content } from "../../constants";
import { Panel, DesignerNavTabs } from "../panel_header";
import { Link } from "../../link";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop
} from "../designer_panel";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { some, uniq, map, sortBy } from "lodash";
import { t } from "../../i18next_wrapper";

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

    return sortBy(items, x => x.sortKey)
      .filter(filterSearch(this.searchTerm))
      .map((occur, index) => {
        const url = `/app/designer/events/`
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
        some(item.items.map(filterSearch(this.searchTerm))))
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
    const years = uniq(map(this.props.calendarRows, "year"));
    return years.map(year => {
      return <div key={moment(year, "YY").unix()}
        className="farm-event-calendar-rows">
        <div className="farm-event-year">
          20{year}
        </div>
        {this.renderCalendarRowsInYear(year)}
      </div>;
    });
  }

  render() {
    return <DesignerPanel panelName={"farm-event"} panel={Panel.FarmEvents}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.FarmEvents}
        linkTo={"/app/designer/events/add"}
        title={t("Add event")}
        noIcon={true}>
        <i className="fa fa-calendar" onClick={this.resetCalendar} />
        <input
          value={this.state.searchTerm}
          onChange={e => this.setState({ searchTerm: e.currentTarget.value })}
          placeholder={t("Search your events...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"farm-event"}>
        <div className="farm-events">
          <EmptyStateWrapper
            notEmpty={this.props.calendarRows.length > 0}
            title={t("No events scheduled.")}
            text={t(Content.NOTHING_SCHEDULED)}
            colorScheme="events"
            graphic={EmptyStateGraphic.farm_events}>
            {this.renderCalendarRows()}
          </EmptyStateWrapper>
        </div>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const FarmEvents = connect(mapStateToProps)(PureFarmEvents);
