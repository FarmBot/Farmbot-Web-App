import React from "react";
import { t } from "../i18next_wrapper";
import { floor, isUndefined, range, round } from "lodash";
import { Curve } from "farmbot/dist/resources/api_resources";
import { Color, Popover } from "../ui";
import {
  maxValue, maxDay, populatedData, inData, addOrRemoveItem, dataFull, scaleData,
} from "./data_actions";
import {
  CurveIconProps,
  CurveSvgProps, CurveSvgWithPopoverProps, DataLabelsProps, DataProps, PlotTools,
  WarningLinesContent,
  GetWarningLinesContentProps,
  WarningLinesProps,
  XAxisProps, YAxisProps,
} from "./interfaces";
import { curveColor, curvePanelColor, CurveType } from "./templates";
import { TextInRoundedSvgBox } from "../farm_designer/map/background/grid_labels";
import { editCurve } from "./edit_curve";
import {
  getZAtLocation,
} from "../farm_designer/map/layers/points/interpolation_map";
import { Actions } from "../constants";
import { Path } from "../internal_urls";

const X_MAX = 120;
const svgXMax = (data: Curve["data"]) => X_MAX + 25 + 1.5 * X_MAX / maxDay(data);
const Y_MAX = 70;
const svgYMax = () => Y_MAX / (Path.startsWith(Path.plants()) ? 2 : 1);

/** Plot x value normalized to plot extents. */
const normDay = (data: Curve["data"]) => (day: string | number) =>
  round(parseInt("" + day) / maxDay(data) * X_MAX, 2);

/** Plot y value normalized to plot extents. */
const normValue = (data: Curve["data"]) => (value: number) =>
  round(svgYMax() - parseInt("" + value) / maxValue(data) * svgYMax(), 2);

export const CurveSvg = (props: CurveSvgProps) => {
  const { curve, dispatch, editable, hovered, setHovered } = props;
  const { data } = curve.body;
  const normX = normDay(data);
  const normY = normValue(data);
  const plotTools: PlotTools = {
    normX,
    normY,
    xMax: normX(maxDay(data)),
    yMax: normY(maxValue(data)),
    xZero: normX(0),
    yZero: normY(0),
  };
  const commonProps = { curve, plotTools };
  const [dragging, setDragging] = React.useState<string | undefined>(undefined);
  const showHoverEffect = (day: string | undefined) => {
    const dragHover = dragging == day;
    const hoveredDay = hovered == day;
    const lastDay = day == "" + (maxDay(data) + 1);
    const greaterThanLast = parseInt("" + hovered) > parseInt("" + day);
    const hover = hoveredDay || (lastDay && greaterThanLast);
    return dragHover || (!dragging && hover);
  };
  return <svg className={"curve-svg"} width={"100%"} height={"100%"}
    viewBox={`-15 -10 ${svgXMax(data)} ${svgYMax() + 30}`}
    style={dragging ? { cursor: "grabbing" } : {}}
    onMouseUp={() => setDragging(undefined)}
    onMouseLeave={() => setDragging(undefined)}
    onMouseMove={e => {
      if (!dragging) { return; }
      const newValue = data[parseInt(dragging)]
        - round(e.movementY * maxValue(data) / svgYMax() / 3);
      const value = newValue < 0 ? 0 : newValue;
      dispatch(editCurve(curve, {
        data: {
          ...curve.body.data,
          [parseInt(dragging)]: value,
        }
      }));
    }}>
    <Data {...commonProps} dispatch={dispatch} editable={editable}
      setHovered={setHovered} showHoverEffect={showHoverEffect}
      setDragging={setDragging} dragging={dragging} />
    <XAxis {...commonProps} />
    <YAxis {...commonProps} />
    <WarningLines {...commonProps}
      setOpen={props.setOpen}
      warningLinesContent={props.warningLinesContent} />
    <DataLabels {...commonProps} showHoverEffect={showHoverEffect} />
  </svg>;
};

export const CurveSvgWithPopover = (props: CurveSvgWithPopoverProps) => {
  const [open, setOpen] = React.useState(false);
  const warnings = getWarningLinesContent({
    curve: props.curve,
    sourceFbosConfig: props.sourceFbosConfig,
    x: props.x,
    y: props.y,
    farmwareEnvs: props.farmwareEnvs,
    soilHeightPoints: props.soilHeightPoints,
    botSize: props.botSize,
  });
  return <div className={"curve-svg-wrapper"}>
    <Popover
      isOpen={open}
      popoverClassName={"warning-line-text-popover"}
      target={<div className={"target"} />}
      content={<div className={"warning-text"}>
        <p className={"top"}>{warnings.title}</p>
        {warnings.lines.map((line, index) => {
          const value = line.textValue || line.value;
          return value > 0 && <p key={index}>
            {line.text}: {round(value)}mm
          </p>;
        })}
      </div>} />
    <CurveSvg dispatch={props.dispatch} curve={props.curve}
      sourceFbosConfig={props.sourceFbosConfig}
      botSize={props.botSize}
      hovered={props.hovered} setHovered={props.setHovered}
      warningLinesContent={warnings}
      setOpen={setOpen}
      editable={props.editable} />
  </div>;
};

const Data = (props: DataProps) => {
  const { curve, setHovered, showHoverEffect, dragging } = props;
  const { normX, normY, yZero, yMax } = props.plotTools;
  const { data, type } = curve.body;
  const fullWidth = X_MAX / maxDay(data);
  const fullHeight = yZero - yMax;
  const lastDay = maxDay(data) + 1;
  const [hoveredValue, setHoveredValue] =
    React.useState<string | undefined>(undefined);
  const setHoveredSpread = (value: number | undefined) =>
    props.dispatch({
      type: Actions.TOGGLE_HOVERED_SPREAD,
      payload: value,
    });
  const bar = (last?: boolean) => ([day, value]: [string, number]) => {
    const x = (inputWidth: number) => normX(day) - inputWidth / 2;
    const y = normY(value);
    const height = yZero - y;
    return <g key={day} id={last ? "last-bar" : "bar"}>
      <rect id={"visible-bar"}
        stroke={last || showHoverEffect(day) ? curveColor(curve) : "none"}
        strokeWidth={0.5} strokeDasharray={last ? 0.5 : undefined}
        x={x(fullWidth * 0.75)} y={y}
        fill={last ? "transparent" : undefined}
        width={fullWidth * 0.75} height={height} />
      <rect id={"hover-bar"}
        onMouseEnter={() => {
          setHovered(day);
          !props.editable && type == CurveType.spread &&
            setHoveredSpread(value);
        }}
        onMouseLeave={() => {
          setHovered(undefined);
          !props.editable && type == CurveType.spread &&
            setHoveredSpread(undefined);

        }}
        fill={Color.white} opacity={0}
        x={x(fullWidth)} y={0}
        width={fullWidth} height={fullHeight} />
    </g>;
  };
  return <g id={"data"}>
    <defs>
      <linearGradient id={`${type}-bar-fill`}
        x1={0} y1={0} x2={0} y2={"100%"}>
        <stop offset={"0%"} stopColor={curveColor(curve)} stopOpacity={0.6} />
        <stop offset={"100%"} stopColor={curveColor(curve)} stopOpacity={0.2} />
      </linearGradient>
    </defs>
    <g id={"bars"} stroke={"none"} fill={`url(#${type}-bar-fill)`}>
      {Object.entries(populatedData(data)).map(bar())}
      {bar(true)(["" + lastDay, data[maxDay(data)]])}
    </g>
    {props.editable &&
      <path id={"line"}
        stroke={curveColor(curve)} strokeWidth={0.5} fill={"none"}
        d={Object.entries(data)
          .map(([day, value], index) => {
            const prefix = index == 0 ? "M" : "L";
            return `${prefix}${normX(day)},${normY(value)}`;
          }).join(" ")} />}
    {props.editable &&
      <g id={"values"}
        stroke={curveColor(curve)}
        strokeWidth={0.5}
        fill={curveColor(curve)}
        fillOpacity={0.5}>
        {Object.entries(data)
          .map(([day, value]) => {
            return <circle key={day}
              style={{ cursor: "row-resize" }}
              onMouseDown={() => props.setDragging(day)}
              cx={normX(day)}
              cy={normY(value)}
              r={1} />;
          })}
      </g>}
    {props.editable &&
      <g id={"other-values"}
        stroke={Color.gray}
        strokeWidth={0.5}
        fill={Color.white}
        fillOpacity={0.5}>
        {Object.entries(populatedData(data))
          .map(([day, value]) => {
            if (inData(data, day)) { return; }
            const show = hoveredValue == day && !dragging;
            const opacity = show ? 1 : 0;
            const cursor = dataFull(data) ? "not-allowed" : "copy";
            return <circle key={day}
              style={{ cursor }}
              onMouseEnter={() => setHoveredValue(day)}
              onMouseLeave={() => setHoveredValue(undefined)}
              onClick={() => props.editable && props.dispatch(editCurve(curve, {
                data: addOrRemoveItem(curve.body.data, day, value),
              }))}
              opacity={opacity} fillOpacity={opacity}
              cx={normX(day)}
              cy={normY(value)}
              r={1.5} />;
          })}
      </g>}
  </g>;
};

const DataLabels = (props: DataLabelsProps) => {
  const { curve, showHoverEffect } = props;
  const { normX, normY } = props.plotTools;
  const { data, type } = curve.body;
  const label = (plus: string) =>
    ([day, value]: [string, number]) => {
      const xLabel = normX(day);
      const yLabel = normY(value);
      const unit = type == CurveType.water ? "mL" : "mm";
      const text = `${t("Day {{ num }}", { num: day })}${plus}: ${value} ${unit}`;
      const getPosition = () => {
        if (xLabel < 0.25 * X_MAX) { return "left"; }
        if (xLabel > 0.75 * X_MAX) { return "right"; }
        return "center";
      };
      const position = getPosition();
      return <g id={day} key={day}>
        {showHoverEffect(day) &&
          <g id={"label"}>
            <TextInRoundedSvgBox x={xLabel} y={yLabel} radius={1}
              width={text.length * 2 + 6} height={6} fontSize={4}
              fill={Color.darkGray} caret={true} position={position}>
              {text}
            </TextInRoundedSvgBox>
          </g>}
      </g>;
    };
  return <g id={"data-labels"} className={"data-labels"}>
    {Object.entries(populatedData(data)).map(label(""))}
    {label("+")(["" + (maxDay(data) + 1), data[maxDay(data)]])}
  </g>;
};

const XAxis = (props: XAxisProps) => {
  const { data } = props.curve.body;
  const { normX, yZero, yMax, xMax } = props.plotTools;
  const lastLabel = floor(maxDay(data) + 1, -1);
  const step = maxDay(data) > 100 ? 20 : 10;
  const dayLabels = [1].concat(range(step, lastLabel + 1, step));
  return <g id={"x-axis"}>
    <g id={"day-labels"} fontSize={5} textAnchor={"middle"}>
      {dayLabels.map(day =>
        <text key={day} x={normX(day)} y={yZero + 6}>{day}</text>)}
    </g>
    <line id={"y-axis-vertical-line"}
      stroke={"var(--text-color"} opacity={0.2} strokeWidth={0.3}
      x1={0} y1={yZero} x2={0} y2={yMax} />
    <text id={"x-axis-label"}
      fontSize={5} textAnchor={"middle"}
      fontWeight={"bold"}
      x={xMax / 2} y={yZero + 14}>
      {t("DAY")}
    </text>
  </g>;
};

const YAxis = (props: YAxisProps) => {
  const { data } = props.curve.body;
  const { normY, xMax } = props.plotTools;
  const thirds = maxValue(data) / 3;
  const yStep = floor(thirds, 1 - ("" + floor(thirds)).length);
  return <g id={"y-axis"}>
    <g id={"value-labels"}>
      {range(yStep, yStep * 10, yStep).map(value => {
        const y = normY(value);
        return <g id={"" + value} key={value}>
          {y > -1 &&
            <text fontSize={5} textAnchor={"end"}
              x={-2} y={y + 1.5}>
              {value}
            </text>}
          <line className={"y-axis-line"}
            stroke={"var(--text-color"} opacity={0.2} strokeWidth={0.3}
            x1={0} y1={y} x2={xMax} y2={y} />
        </g>;
      })}
    </g>
    <text id={"y-axis-label"}
      fontSize={5} textAnchor={"end"}
      fontWeight={"bold"}
      x={0} y={-5}>
      {props.curve.body.type == CurveType.water ? t("mL") : t("mm")}
    </text>
  </g>;
};

export const getWarningLinesContent =
  (props: GetWarningLinesContentProps): WarningLinesContent => {
    const { x, y } = props;
    const gantryHeight = props.sourceFbosConfig("gantry_height").value as number;
    const locationSoilHeight = getZAtLocation({
      x,
      y,
      points: props.soilHeightPoints,
      farmwareEnvs: props.farmwareEnvs,
    });
    const soilHeight = locationSoilHeight
      || props.sourceFbosConfig("soil_height").value as number;
    const utmClearance = Math.abs(soilHeight);
    const gantryClearance = utmClearance + gantryHeight;
    const xLength = props.botSize.x.value;
    const yLength = props.botSize.y.value;
    const xPosition = x || (xLength / 2);
    const yPosition = y || (yLength / 2);
    const distanceToEdge = {
      x: { min: xPosition * 2, max: (xLength - xPosition) * 2 },
      y: { min: yPosition * 2, max: (yLength - yPosition) * 2 },
    };
    const maxValueNum = maxValue(props.curve.body.data);
    const edgeBleed = {
      x: {
        min: (maxValueNum - distanceToEdge.x.min) / 2,
        max: (maxValueNum - distanceToEdge.x.max) / 2,
      },
      y: {
        min: (maxValueNum - distanceToEdge.y.min) / 2,
        max: (maxValueNum - distanceToEdge.y.max) / 2,
      },
    };
    switch (props.curve.body.type) {
      case CurveType.spread:
        return {
          title: t("Plant may spread beyond the growing area"),
          lines: isUndefined(x) || isUndefined(y)
            ? [
              { value: yLength, text: t("Y-axis length"), style: "high" },
              { value: xLength, text: t("X-axis length"), style: "high" },
            ]
            : [
              {
                value: distanceToEdge.x.min, textValue: edgeBleed.x.min,
                text: t("X-min bleed"), style: "low"
              },
              {
                value: distanceToEdge.y.min, textValue: edgeBleed.y.min,
                text: t("Y-min bleed"), style: "high"
              },
              {
                value: distanceToEdge.x.max, textValue: edgeBleed.x.max,
                text: t("X-max bleed"), style: "low"
              },
              {
                value: distanceToEdge.y.max, textValue: edgeBleed.y.max,
                text: t("Y-max bleed"), style: "high"
              },
            ]
        };
      case CurveType.height: return {
        title: t("Plant may exceed the distance between the soil and FarmBot"),
        lines: [
          { value: gantryClearance, text: t("Gantry main beam"), style: "high" },
          { value: utmClearance, text: t("Fully raised tool head"), style: "low" },
        ]
      };
      default: return { title: "", lines: [] };
    }
  };

const WarningLines = (props: WarningLinesProps) => {
  const { normY, xZero } = props.plotTools;
  const { lines } = props.warningLinesContent;
  return <g id={"warning-lines"}>
    {lines.map((line, index) =>
      line.value &&
      <line id={"warning-line"} className={"warning-line"} key={index}
        strokeDasharray={line.style == "low" ? 2 : undefined}
        stroke={Color.darkOrange} opacity={0.75} strokeWidth={0.3}
        x1={xZero} y1={normY(line.value)}
        x2={svgXMax(props.curve.body.data) - 20} y2={normY(line.value)} />)}
    {lines.map((clearance, index) =>
      clearance.value &&
      <text id={"warning-icon"} key={index}
        onMouseEnter={() => props.setOpen(true)}
        onMouseLeave={() => props.setOpen(false)}
        fontSize={5} textAnchor={"end"}
        fill={Color.darkOrange} fontWeight={"bold"}
        x={svgXMax(props.curve.body.data) - 15} y={normY(clearance.value) + 1}>
        ⚠
      </text>)}
  </g>;
};

export const CurveIcon = (props: CurveIconProps) => {
  const data = scaleData(props.curve.body.data, 100, 100);
  const normX = normDay(data);
  const normY = normValue(data);
  const curvePathArray = Object.entries(populatedData(data))
    .map(([day, value], index) => {
      const prefix = index == 0 ? "M" : "L";
      return `${prefix}${normX(day)},${normY(value)}`;
    });
  return <svg className={"curve-icon"}
    width={"32px"} height={"32px"}
    viewBox={`-15 -10 ${X_MAX + 25} ${svgYMax() + 30}`}>
    <path id={"fill"} strokeWidth={0}
      fill={curvePanelColor(props.curve)}
      d={curvePathArray
        .concat(`L${normX(maxDay(data))},${normY(0)}`)
        .concat(`L${normX(1)},${normY(0)}z`)
        .join(" ")} />
    <path id={"line"}
      stroke={curveColor(props.curve)} strokeWidth={5}
      fill={"none"}
      d={curvePathArray.join(" ")} />
  </svg>;
};
