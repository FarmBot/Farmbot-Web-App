import React from "react";
import moment from "moment";
import { range, clamp } from "lodash";
import { SensorReadingPlotProps } from "./interfaces";
import { calcEndOfPeriod } from "./filter_readings";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { timeFormatString } from "../../util";

/** For SensorReadings plot. */
export const calcTimeParams = (timePeriod: number): {
  timeStep: number, timeScale: number
} => {
  if (timePeriod > 3600 * 24 * 32) { // year
    return { timeStep: 3600 * 24 * 30, timeScale: 40 * 30 * 12 };
  }
  if (timePeriod > 3600 * 24 * 8) { // month
    return { timeStep: 3600 * 24, timeScale: 40 * 30 };
  }
  if (timePeriod > 3600 * 25) { // week
    return { timeStep: 3600 * 24, timeScale: 40 * 7 };
  }
  // day
  return { timeStep: 3600, timeScale: 40 };
};

interface PlotProps {
  timePeriod: number;
  timeStep: number;
  timeScale: number;
  timeMax: moment.Moment;
  yZero: number;
  yMax: number;
  xMax: number;
  showPreviousPeriod: boolean;
  timeSettings: TimeSettings;
}

/** Plot axes and labels. */
const Axes =
  ({ yZero, yMax, xMax }: { yZero: number, yMax: number, xMax: number }) =>
    <g id="axes">
      <line id="y-axis" strokeWidth="5px"
        x1={0} y1={yZero} x2={0} y2={yMax} />

      <text id="y-axis-label" textAnchor="middle" fontWeight="normal"
        x={-250} y={yZero - 500}>
        {t("analog")}
      </text>

      {[0, 1].map(v =>
        <text key={"digital_value_y_axis_label_" + v}
          textAnchor="start" alignmentBaseline="middle"
          x={xMax + 50} y={yZero - v * 1023}>
          {v}
        </text>)}

      <text id="y-axis-label" textAnchor="start" fontWeight="normal"
        x={xMax + 50} y={yZero - 500}>
        {t("digital")}
      </text>

      <line id="x-axis" strokeWidth="5px"
        x1={0} y1={yZero} x2={xMax} y2={yZero} />
    </g>;

/** y-axis (SensorReading value) */
const HorizontalGridlines = (props: PlotProps) =>
  <g id="horizontal-gridlines">
    {range(0, 1100, 100).map(y => {
      const id = "horizontal_gridline_" + y;
      return <g id={id} key={id}>
        <text textAnchor="end" alignmentBaseline="middle"
          x={-50} y={props.yZero - y}>
          {y}
        </text>
        <line stroke="#777"
          x1={0} y1={props.yZero - y} x2={props.xMax} y2={props.yZero - y} />
      </g>;
    })}
  </g>;

/** x-axis (time) labels */
const createTimeLabel =
  (x: number, timePeriod: number, timeStep: number, timeMax: moment.Moment,
    timeSettings: TimeSettings) =>
    (period: "current" | "previous"): string => {
      const calcFormat = () => {
        if (timePeriod > 3600 * 24 * 32) { return "MMM D YYYY"; }
        if (timeStep > 3600) { return "MMM D"; }
        return timeFormatString(timeSettings);
      };
      return timeMax.clone()
        .subtract(timePeriod * (period === "current" ? 1 : 2) - x,
          "seconds")
        .format(calcFormat());
    };

/** x-axis (time) */
const VerticalGridlines = (props: PlotProps) =>
  <g id="vertical-gridlines">
    {range(props.timeStep, props.timePeriod + 1, props.timeStep).map(x => {
      const id = "vertical_gridline_" + x;
      /** label & major gridline every 3 hours/days/months and every week day */
      const major = (x / props.timeStep)
        % (props.timePeriod == 3600 * 24 * 7 ? 1 : 3) == 0;
      const createLabel = createTimeLabel(
        x, props.timePeriod, props.timeStep, props.timeMax, props.timeSettings);
      return <g id={id} key={id}>
        {major &&
          <text textAnchor="middle"
            x={x / props.timeScale}
            y={props.yZero + 100}>
            {createLabel("current")}
          </text>}
        {major && props.showPreviousPeriod &&
          <text textAnchor="middle" stroke={"#777"}
            x={x / props.timeScale}
            y={props.yZero + 200}>
            {createLabel("previous")}
          </text>}
        <line stroke={major ? "#ccc" : "#777"}
          x1={x / props.timeScale}
          y1={props.yZero}
          x2={x / props.timeScale}
          y2={props.yMax} />
      </g>;
    })}
  </g>;

/** SensorReadings (current and maybe previous time periods) */
const DataPoints = ({ plotProps, parentProps }: {
  plotProps: PlotProps, parentProps: SensorReadingPlotProps
}) =>
  <g id="sensor-readings">
    {["previous", "current"].map((period: "current" | "previous") =>
      <g id={period} key={period}>
        {parentProps.readingsForPeriod(period).map(r => {
          const read_at =
            moment(r.body.read_at).utcOffset(parentProps.timeSettings.utcOffset);
          const unixMax = calcEndOfPeriod(plotProps.timePeriod,
            plotProps.timeMax.unix(), period);
          /** calculated using scaled plot distance from x-axis end */
          const cx = plotProps.xMax
            - (unixMax - read_at.unix()) / plotProps.timeScale;
          const cy = plotProps.yZero - clamp(r.body.value
            * (r.body.mode == 0 && r.body.value <= 1 ? 1023 : 1), 0, 1023);
          const color = period === "current" ? "#ccc" : "#777";
          const selected = parentProps.hovered === r.uuid;
          return <g id={r.uuid} key={r.uuid}>
            <circle fill={color} stroke={color}
              onMouseEnter={() => parentProps.hover(r.uuid)}
              onMouseLeave={() => parentProps.hover(undefined)}
              r={selected ? 25 : 15}
              cx={cx}
              cy={cy} />
            {selected &&
              <text
                x={cx + 30}
                y={cy - 10}>
                {r.body.value}
              </text>}
          </g>;
        })}
      </g>)}
  </g>;

export const SensorReadingsPlot = (props: SensorReadingPlotProps) => {
  const { timePeriod, endDate, timeSettings, showPreviousPeriod } = props;
  const timeVBMax = 2800;
  const yZero = 1100;
  const { timeStep, timeScale } = calcTimeParams(props.timePeriod);
  const plotProps: PlotProps = {
    timePeriod,
    timeStep,
    timeScale,
    timeMax: moment.unix(endDate).startOf("hour").utcOffset(timeSettings.utcOffset),
    yZero,
    yMax: yZero - 1023,
    xMax: timeVBMax - 640,
    showPreviousPeriod,
    timeSettings,
  };

  return <svg
    className="sensor-readings-plot"
    width="100%"
    height="100%"
    viewBox={`-350 -100 ${timeVBMax} ${plotProps.yZero + 400}`}>
    <Axes yZero={plotProps.yZero} yMax={plotProps.yMax} xMax={plotProps.xMax} />
    <VerticalGridlines {...plotProps} />
    <HorizontalGridlines {...plotProps} />
    <DataPoints plotProps={plotProps} parentProps={props} />
  </svg>;
};
