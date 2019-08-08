import * as React from "react";
import { Widget, WidgetHeader, WidgetBody, WidgetFooter } from "../../ui";
import { SensorReadingsProps, SensorReadingsState } from "./interfaces";
import { SensorReadingsTable } from "./table";
import { filterSensorReadings } from "./filter_readings";
import {
  TimePeriodSelection, DateDisplay, getEndDate
} from "./time_period_selection";
import { LocationSelection, LocationDisplay } from "./location_selection";
import { SensorSelection } from "./sensor_selection";
import { ToolTips } from "../../constants";
import { TaggedSensor } from "farmbot";
import { AxisInputBoxGroupState } from "../interfaces";
import { SensorReadingsPlot } from "./graph";
import { t } from "../../i18next_wrapper";

export class SensorReadings
  extends React.Component<SensorReadingsProps, SensorReadingsState> {
  state: SensorReadingsState = {
    sensor: undefined,
    timePeriod: 3600 * 24,
    endDate: getEndDate(this.props.sensorReadings),
    location: undefined,
    showPreviousPeriod: false,
    deviation: 0,
    hovered: undefined,
  };

  /** Toggle display of previous time period. */
  togglePrevious = () =>
    this.setState({ showPreviousPeriod: !this.state.showPreviousPeriod });
  setSensor = (sensor: TaggedSensor | undefined) => this.setState({ sensor });
  setEndDate = (endDate: number) => this.setState({ endDate });
  setTimePeriod = (timePeriod: number) => this.setState({ timePeriod });
  setLocation = (location: AxisInputBoxGroupState | undefined) =>
    this.setState({ location });
  setDeviation = (deviation: number) => this.setState({ deviation });
  hover = (hovered: string | undefined) => this.setState({ hovered });
  clearFilters = () => this.setState({
    sensor: undefined,
    timePeriod: 3600 * 24,
    endDate: getEndDate(this.props.sensorReadings),
    location: undefined,
    showPreviousPeriod: false,
    deviation: 0,
  });

  render() {
    /** Return filtered sensor readings for the specified period.
     * Must be in render() so that state updates. */
    const readingsForPeriod =
      filterSensorReadings(this.props.sensorReadings, this.state);

    return <Widget className="sensor-history-widget">
      <WidgetHeader
        title={t("Sensor History")}
        helpText={ToolTips.SENSOR_HISTORY}>
        <button className="fb-button gray" onClick={this.clearFilters}>
          {t("clear filters")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <SensorSelection
          selectedSensor={this.state.sensor}
          sensors={this.props.sensors}
          setSensor={this.setSensor} />
        <TimePeriodSelection
          timePeriod={this.state.timePeriod}
          endDate={this.state.endDate}
          showPreviousPeriod={this.state.showPreviousPeriod}
          setEndDate={this.setEndDate}
          setPeriod={this.setTimePeriod}
          togglePrevious={this.togglePrevious} />
        <LocationSelection
          location={this.state.location}
          deviation={this.state.deviation}
          setLocation={this.setLocation}
          setDeviation={this.setDeviation} />
        <hr />
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
      </WidgetBody>
      <WidgetFooter>
        <div className="sensor-history-footer">
          <DateDisplay
            endDate={this.state.endDate}
            showPreviousPeriod={this.state.showPreviousPeriod}
            timePeriod={this.state.timePeriod}
            timeSettings={this.props.timeSettings} />
          <LocationDisplay
            location={this.state.location}
            deviation={this.state.deviation} />
        </div>
      </WidgetFooter>
    </Widget>;
  }
}
