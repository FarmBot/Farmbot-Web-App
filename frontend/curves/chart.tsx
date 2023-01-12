import React from "react";
import { t } from "../i18next_wrapper";
import { floor, range, round } from "lodash";
import { Curve } from "farmbot/dist/resources/api_resources";
import { Color } from "../ui";
import {
  maxValue, maxDay, populatedData, inData, addOrRemoveItem,
} from "./data_actions";
import {
  CurveSvgProps, DataLabelsProps, DataProps, PlotTools, WarningLinesProps,
  XAxisProps, YAxisProps,
} from "./interfaces";
import { curveColor, CurveType } from "./templates";
import { TextInRoundedSvgBox } from "../farm_designer/map/background/grid_labels";
import { editCurve } from "./edit_curve";

const X_MAX = 120;
const SVG_X_MAX = X_MAX + 25;
const Y_MAX = 100;

/** Plot x value normalized to plot extents. */
const normDay = (data: Curve["data"]) => (day: string | number) =>
  round(parseInt("" + day) / maxDay(data) * X_MAX, 2);

/** Plot y value normalized to plot extents. */
const normValue = (data: Curve["data"]) => (value: number) =>
  round(Y_MAX - parseInt("" + value) / maxValue(data) * Y_MAX, 2);

export const CurveSvg = (props: CurveSvgProps) => {
  const { curve, dispatch, editable } = props;
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
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  const [dragging, setDragging] = React.useState<string | undefined>(undefined);
  return <svg width={"100%"} height={"100%"}
    viewBox={`-15 -10 ${SVG_X_MAX} ${Y_MAX + 30}`}
    style={dragging ? { cursor: "grabbing" } : {}}
    onMouseUp={() => setDragging(undefined)}
    onMouseLeave={() => setDragging(undefined)}
    onMouseMove={e => {
      if (!dragging) { return; }
      const newValue = data[parseInt(dragging)]
        - round(e.movementY * maxValue(data) / Y_MAX / 3);
      dispatch(editCurve(curve, {
        data: {
          ...curve.body.data,
          [parseInt(dragging)]: newValue,
        }
      }));
    }}>
    <Data {...commonProps} dispatch={dispatch} editable={editable}
      setHovered={setHovered} hovered={hovered}
      setDragging={setDragging} dragging={dragging} />
    <XAxis {...commonProps} />
    <YAxis {...commonProps} />
    <WarningLines {...commonProps}
      sourceFbosConfig={props.sourceFbosConfig}
      botSize={props.botSize} />
    <DataLabels {...commonProps} hovered={hovered} />
  </svg>;
};

const Data = (props: DataProps) => {
  const { curve, setHovered, hovered } = props;
  const { normX, normY, yZero } = props.plotTools;
  const { data, type } = curve.body;
  const width = barWidth(data);
  const lastDay = maxDay(data) + 1;
  const [hoveredValue, setHoveredValue] =
    React.useState<string | undefined>(undefined);
  return <g id={"data"}>
    <defs>
      <linearGradient id={`${type}-bar-fill`}
        x1={0} y1={0} x2={0} y2={"100%"}>
        <stop offset={"0%"} stopColor={curveColor(curve)} stopOpacity={0.6} />
        <stop offset={"100%"} stopColor={curveColor(curve)} stopOpacity={0.2} />
      </linearGradient>
    </defs>
    <g id={"bars"} stroke={"none"} fill={`url(#${type}-bar-fill)`}>
      {Object.entries(populatedData(data))
        .map(([day, value]) => {
          return <rect key={day}
            onMouseEnter={() => setHovered(day)}
            onMouseLeave={() => setHovered(undefined)}
            stroke={hovered == day ? curveColor(curve) : "none"}
            strokeWidth={0.5}
            x={normX(day) - width / 2} y={normY(value)}
            width={width} height={yZero - normY(value)} />;
        })}
      <rect id={"last-bar"}
        onMouseEnter={() => setHovered("" + lastDay)}
        onMouseLeave={() => setHovered(undefined)}
        stroke={curveColor(curve)} strokeDasharray={0.5}
        x={normX(lastDay) - width / 2} y={normY(data[maxDay(data)])}
        width={width} height={yZero - normY(data[maxDay(data)])}
        fill={Color.white} strokeWidth={0.5} />
    </g>
    <path id={"line"}
      stroke={curveColor(curve)} strokeWidth={0.5} fill={"none"}
      d={Object.entries(data)
        .map(([day, value], index) => {
          const prefix = index == 0 ? "M" : "L";
          return `${prefix}${normX(day)},${normY(value)}`;
        }).join(" ")} />
    <g id={"values"}
      stroke={curveColor(curve)}
      strokeWidth={0.5}
      fill={curveColor(curve)}
      fillOpacity={0.5}>
      {Object.entries(data)
        .map(([day, value]) => {
          return <circle key={day}
            style={props.editable ? { cursor: "grab" } : {}}
            onMouseDown={() => props.editable && props.setDragging(day)}
            cx={normX(day)}
            cy={normY(value)}
            r={1} />;
        })}
    </g>
    <g id={"other-values"}
      stroke={Color.gray}
      strokeWidth={0.5}
      fill={Color.white}
      fillOpacity={0.5}>
      {Object.entries(populatedData(data))
        .map(([day, value]) => {
          if (inData(data, day)) { return; }
          const show = props.editable && hoveredValue == day && !props.dragging;
          const opacity = show ? 1 : 0;
          return <circle key={day}
            onMouseEnter={() => setHoveredValue(day)}
            onMouseLeave={() => setHoveredValue(undefined)}
            onClick={() => props.editable && props.dispatch(editCurve(curve, {
              data: addOrRemoveItem(curve.body.data, day, value),
            }))}
            opacity={opacity} fillOpacity={opacity}
            cx={normX(day)}
            cy={normY(value)}
            r={1} />;
        })}
    </g>
  </g>;
};

const barWidth = (data: Curve["data"]) =>
  Math.max(1, floor(X_MAX * 0.75 / maxDay(data)));

const DataLabels = (props: DataLabelsProps) => {
  const { curve, hovered } = props;
  const { normX, normY } = props.plotTools;
  const { data } = curve.body;
  const label = (plus: string) =>
    ([day, value]: [string, number]) => {
      const xLabel = normX(day);
      const yLabel = normY(value);
      const text = `${t("Day {{ num }}", { num: day })}${plus}: ${value} mL`;
      const getPosition = () => {
        if (xLabel < 0.25 * X_MAX) { return "left"; }
        if (xLabel > 0.75 * X_MAX) { return "right"; }
        return "center";
      };
      const position = getPosition();
      return <g id={day} key={day}>
        {hovered == day &&
          <g id={"label"}>
            <TextInRoundedSvgBox x={xLabel} y={yLabel} radius={1}
              width={text.length * 2 + 6} height={6} fontSize={4}
              fill={Color.darkGray} caret={true} position={position}>
              {text}
            </TextInRoundedSvgBox>
          </g>}
      </g>;
    };
  return <g id={"data-labels"}>
    {Object.entries(populatedData(data)).map(label(""))}
    {label("+")(["" + (maxDay(data) + 1), data[maxDay(data)]])}
  </g>;
};

const XAxis = (props: XAxisProps) => {
  const { data } = props.curve.body;
  const { normX, yZero, yMax, xMax } = props.plotTools;
  const lastLabel = floor(maxDay(data) + 1, -1);
  const dayLabels = [1].concat(range(10, lastLabel + 1, 10));
  return <g id={"x-axis"}>
    <g id={"day-labels"} fontSize={5} textAnchor={"middle"} fill={Color.darkGray}>
      {dayLabels.map(day => <text key={day} x={normX(day)} y={108}>{day}</text>)}
    </g>
    <line id={"y-axis-vertical-line"}
      stroke={Color.darkGray} opacity={0.1} strokeWidth={0.3}
      x1={0} y1={yZero} x2={0} y2={yMax} />
    <text id={"x-axis-label"}
      fontSize={5} textAnchor={"middle"}
      fill={Color.darkGray} fontWeight={"bold"}
      x={xMax / 2} y={115}>
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
          <text fontSize={5} textAnchor={"end"} fill={Color.darkGray}
            x={-2} y={y + 1.5}>
            {value}
          </text>
          <line stroke={Color.darkGray} opacity={0.1} strokeWidth={0.3}
            x1={0} y1={y} x2={xMax} y2={y} />
        </g>;
      })}
    </g>
    <text id={"y-axis-label"}
      fontSize={5} textAnchor={"end"}
      fill={Color.darkGray} fontWeight={"bold"}
      x={0} y={-5}>
      {props.curve.body.type == CurveType.water ? t("mL") : t("mm")}
    </text>
  </g>;
};

const WarningLines = (props: WarningLinesProps) => {
  const { normY, xZero } = props.plotTools;
  const gantryHeight = props.sourceFbosConfig("gantry_height").value as number;
  const soilHeight = props.sourceFbosConfig("soil_height").value as number;
  const utmClearance = soilHeight;
  const gantryClearance = soilHeight + gantryHeight;
  const xLength = props.botSize.x.value;
  const yLength = props.botSize.y.value;
  interface Content { value: number | undefined, text: string | undefined }
  const lines = (): Record<"low" | "high", Content> => {
    switch (props.curve.body.type) {
      case CurveType.spread: return {
        low: { value: xLength, text: t("X-axis length") },
        high: { value: yLength, text: t("Y-axis length") },
      };
      case CurveType.height: return {
        low: { value: utmClearance, text: t("Fully raise tool head") },
        high: { value: gantryClearance, text: t("Gantry main beam") },
      };
      default: return {
        low: { value: undefined, text: undefined },
        high: { value: undefined, text: undefined },
      };
    }
  };
  const { low, high } = lines();
  const text = props.curve.body.type == CurveType.spread
    ? t("Plant may spread beyond the growing area")
    : t("Plant may exceed the distance between the soil and FarmBot");
  const [hovered, setHovered] = React.useState(false);
  return <g id={"warning-lines"}>
    {low.value &&
      <line id={"low-line"} strokeDasharray={2}
        stroke={Color.darkOrange} opacity={0.75} strokeWidth={0.3}
        x1={xZero} y1={normY(low.value)} x2={SVG_X_MAX} y2={normY(low.value)} />}
    {high.value &&
      <line id={"high-line"}
        stroke={Color.darkOrange} opacity={0.75} strokeWidth={0.3}
        x1={xZero} y1={normY(high.value)} x2={SVG_X_MAX} y2={normY(high.value)} />}
    {Object.values(lines()).map((clearance, index) =>
      clearance.value &&
      <text id={"warning-icon"} key={index}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        fontSize={5} textAnchor={"end"}
        fill={Color.darkOrange} fontWeight={"bold"}
        x={-5} y={normY(clearance.value)}>!</text>)}
    {hovered && <g id={"warning-content"}
      fontSize={5} fill={Color.offWhite}>
      <rect x={0} y={0} width={X_MAX * 0.75} height={Y_MAX * 0.4}
        fill={Color.darkGray} />
      <text x={5} y={10} fontWeight={"bold"}>
        {text.split(" ").slice(0, 5).join(" ")}
      </text>
      <text x={5} y={15} fontWeight={"bold"}>
        {text.split(" ").slice(5).join(" ")}:
      </text>
      <text x={5} y={25}>{high.text}: {high.value}mm</text>
      <text x={5} y={30}>{low.text}: {low.value}mm</text>
    </g>}
  </g>;
};
