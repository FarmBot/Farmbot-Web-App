import React from "react";
import { t } from "../../i18next_wrapper";
import { Popover } from "../../ui";
import { SensorReadingsProps, SensorReadingsState } from "./interfaces";
import { SensorReadingsTable } from "./table";
import { filterSensorReadings } from "./filter_readings";
import {
  TimePeriodSelection, DateDisplay, getEndDate,
} from "./time_period_selection";
import { LocationSelection, LocationDisplay } from "./location_selection";
import { SensorSelection } from "./sensor_selection";
import { TaggedSensor } from "farmbot";
import { AxisInputBoxGroupState } from "../../controls/interfaces";
import { SensorReadingsPlot } from "./graph";
import { Position } from "@blueprintjs/core";
import { AddSensorReadingMenu } from "./add_reading";

export class SensorReadings
  extends React.Component<SensorReadingsProps, SensorReadingsState> {
  state: SensorReadingsState = {
    sensor: undefined,
    timePeriod: 3600 * 24,
    endDate: getEndDate(this.props.sensorReadings),
    xyzLocation: undefined,
    showPreviousPeriod: false,
    deviation: 0,
    hovered: undefined,
    addReadingMenuOpen: false,
  };

  /** Toggle display of previous time period. */
  togglePrevious = () =>
    this.setState({ showPreviousPeriod: !this.state.showPreviousPeriod });
  setSensor = (sensor: TaggedSensor | undefined) => this.setState({ sensor });
  setEndDate = (endDate: number) => this.setState({ endDate });
  setTimePeriod = (timePeriod: number) => this.setState({ timePeriod });
  setLocation = (xyzLocation: AxisInputBoxGroupState | undefined) =>
    this.setState({ xyzLocation });
  setDeviation = (deviation: number) => this.setState({ deviation });
  hover = (hovered: string | undefined) => this.setState({ hovered });
  clearFilters = () => this.setState({
    sensor: undefined,
    timePeriod: 3600 * 24,
    endDate: getEndDate(this.props.sensorReadings),
    xyzLocation: undefined,
    showPreviousPeriod: false,
    deviation: 0,
  });

  toggleAddReadingMenu = () => {
    this.setState({ addReadingMenuOpen: !this.state.addReadingMenuOpen });
  };

  render() {
    /** Return filtered sensor readings for the specified period.
     * Must be in render() so that state updates. */
    const readingsForPeriod =
      filterSensorReadings(this.props.sensorReadings, this.state);

    return <div className="sensor-history-widget">
      <div className="panel-header">
        <h2 className="panel-title">{t("History")}</h2>
        <div className="row">
          <button className="fb-button gray"
            title={t("clear filters")}
            onClick={this.clearFilters}>
            {t("clear filters")}
          </button>
          <Popover position={Position.TOP} usePortal={false}
            isOpen={this.state.addReadingMenuOpen}
            target={<button className={"fb-button green"}
              title={t("add sensor reading")}
              onClick={this.toggleAddReadingMenu}>
              <i className={"fa fa-plus"} />
            </button>}
            content={<AddSensorReadingMenu
              sensors={this.props.sensors}
              closeMenu={this.toggleAddReadingMenu}
              timeSettings={this.props.timeSettings}
              dispatch={this.props.dispatch} />} />
        </div>
      </div>
      <div className="grid">
        <SensorSelection
          selectedSensor={this.state.sensor}
          sensors={this.props.sensors}
          setSensor={this.setSensor}
          allOption={true} />
        <TimePeriodSelection
          timePeriod={this.state.timePeriod}
          endDate={this.state.endDate}
          showPreviousPeriod={this.state.showPreviousPeriod}
          setEndDate={this.setEndDate}
          setPeriod={this.setTimePeriod}
          togglePrevious={this.togglePrevious} />
        <LocationSelection
          xyzLocation={this.state.xyzLocation}
          deviation={this.state.deviation}
          setLocation={this.setLocation}
          setDeviation={this.setDeviation} />
        <SensorReadingsPlot
          readingsForPeriod={readingsForPeriod}
          endDate={this.state.endDate}
          timeSettings={this.props.timeSettings}
          hover={this.hover}
          hovered={this.state.hovered}
          showPreviousPeriod={this.state.showPreviousPeriod}
          timePeriod={this.state.timePeriod} />
        <SensorReadingsTable
          readingsForPeriod={readingsForPeriod}
          sensors={this.props.sensors}
          timeSettings={this.props.timeSettings}
          hover={this.hover}
          hovered={this.state.hovered} />
      </div>
      <div className="sensor-history-footer">
        <DateDisplay
          endDate={this.state.endDate}
          showPreviousPeriod={this.state.showPreviousPeriod}
          timePeriod={this.state.timePeriod}
          timeSettings={this.props.timeSettings} />
        <LocationDisplay
          xyzLocation={this.state.xyzLocation}
          deviation={this.state.deviation} />
      </div>
    </div>;
  }
}
