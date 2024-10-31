import React from "react";
import { connect } from "react-redux";
import { mapStateToProps } from "./map_state_to_props";
import {
  FarmEventProps, CalendarOccurrence, FarmEventState,
} from "../farm_designer/interfaces";
import moment from "moment";
import { Content } from "../constants";
import { Panel } from "../farm_designer/panel_header";
import { Link } from "../link";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelTop,
} from "../farm_designer/designer_panel";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { some, uniq, map, sortBy } from "lodash";
import { t } from "../i18next_wrapper";
import { SearchField } from "../ui/search_field";
import { urlFriendly } from "../util";
import { setActiveRegimenByName } from "../regimens/set_active_regimen_by_name";
import { setActiveSequenceByName } from "../sequences/set_active_sequence_by_name";
import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { Path } from "../internal_urls";

const filterSearch = (term: string) => (item: CalendarOccurrence) =>
  item.heading.toLowerCase().includes(term)
  || (item.subheading && item.subheading.toLowerCase().includes(term));

const resourceLink =
  (resourceKind: ExecutableType, resourceName: string) => {
    const path =
      resourceKind == "Regimen" ? Path.regimens : Path.sequences;
    return <Link
      to={path(urlFriendly(resourceName))}
      onClick={resourceKind == "Regimen"
        ? setActiveRegimenByName
        : setActiveSequenceByName}>
      <i className="fa fa-external-link fb-icon-button" />
    </Link>;
  };

export class RawFarmEvents
  extends React.Component<FarmEventProps, FarmEventState> {
  state: FarmEventState = { searchTerm: "" };
  get searchTerm() { return this.state.searchTerm.toLowerCase(); }

  resetCalendar = () => {
    this.setState({ searchTerm: "" });
    const panel = document.querySelector(".farm-events");
    if (panel) { panel.scrollTo(0, 0); }
  };

  innerRows = (items: CalendarOccurrence[]) => {

    return sortBy(items, x => x.sortKey)
      .filter(filterSearch(this.searchTerm))
      .map((occur, index) => {
        const headingResource =
          (occur.executableType == "Regimen" && !occur.subheading)
            ? "Regimen"
            : "Sequence";
        const heading = occur.subheading
          ? occur.subheading
          : occur.heading;
        const subHeading = occur.subheading
          ? <p>{occur.heading}{resourceLink("Regimen", occur.heading)}</p>
          : <p />;
        const variables = occur.variables.map(variable =>
          <span key={variable} className={"farm-event-variable"}>{variable}</span>);

        return <div
          className={
            `farm-event-data-block row ${occur.color}`}
          key={`${occur.sortKey}.${index}`}>
          <div className="farm-event-data-time">
            {occur.timeStr}
          </div>
          <div className="farm-event-data-executable">
            {heading}{resourceLink(headingResource, heading)}
            {subHeading}
            {variables}
          </div>
          <Link className={"edit-link"}
            to={Path.farmEvents(occur.id || "UNSAVED_EVENT")}>
            <i className={"fa fa-pencil-square-o edit-icon fb-icon-button"} />
          </Link>
        </div>;
      });
  };

  renderCalendarRowsInYear(year: number) {
    return this.props.calendarRows.filter((day) => {
      return day.year == year;
    })
      .filter(item => !this.searchTerm ||
        some(item.items.map(filterSearch(this.searchTerm))))
      .map(item => {
        return <div className="farm-event row grid-exp-2" key={item.sortKey}>
          <div className="farm-event-date grid no-gap">
            <div className="farm-event-date-month">
              {item.month}
            </div>
            <div className="farm-event-date-day">
              <b>{item.day}</b>
            </div>
          </div>
          <div className="farm-event-data grid half-gap">
            {this.innerRows(item.items)}
          </div>
        </div>;
      });
  }

  renderCalendarRows() {
    const years = uniq(map(this.props.calendarRows, "year"));
    return years.map(year => {
      return <div key={moment(year, "YY").unix()}
        className="farm-event-calendar-rows grid">
        <div className="farm-event-year">
          20{year}
        </div>
        {this.renderCalendarRowsInYear(year)}
      </div>;
    });
  }

  render() {
    return <DesignerPanel panelName={"farm-event"} panel={Panel.FarmEvents}>
      <DesignerPanelTop
        panel={Panel.FarmEvents}
        linkTo={Path.farmEvents("add")}
        title={t("Add event")}>
        <SearchField nameKey={"events"}
          searchTerm={this.state.searchTerm}
          placeholder={t("Search your events...")}
          onChange={searchTerm => this.setState({ searchTerm })} />
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

export const FarmEvents = connect(mapStateToProps)(RawFarmEvents);
// eslint-disable-next-line import/no-default-export
export default FarmEvents;
