import * as React from "react";
import { StatusRowProps } from "./connectivity_row";
import { CowardlyDictionary } from "../../util";
import { Color } from "../../ui/index";
import { t } from "i18next";

export interface ConnectivityDiagramProps {
  rowData: StatusRowProps[];
  hover: Function;
  hoveredConnection: string | undefined;
}

type SVGLineCoordinates = Record<"x1" | "y1" | "x2" | "y2", number>;

export interface ConnectorProps {
  connectionData: StatusRowProps;
  from: DiagramNodes;
  to: DiagramNodes;
  hover: Function;
  hoveredConnection: string | undefined;
  customLineProps?: SVGLineCoordinates;
}

/**
 * SVG Diagram positions:
 *        top
 *      /    \
 *  left      right
 *      \    /
 *      bottom
 * subLeft - subRight
 */

export enum DiagramNodes {
  browser = "top",
  API = "left",
  MQTT = "right",
  bot = "bottom",
  RPI = "subLeft",
  arduino = "subRight"
}

const diagramPositions: CowardlyDictionary<Record<"x" | "y", number>> = {
  top: { x: 0, y: -75 },
  left: { x: -50, y: 0 },
  right: { x: 50, y: 0 },
  bottom: { x: 0, y: 75 },
  subLeft: { x: -10, y: 110 },
  subRight: { x: 40, y: 110 }
};

export function getTextPosition(name: DiagramNodes): Record<"x" | "y", number> {
  const position = diagramPositions[name];
  if (position) {
    return {
      x: position.x,
      y: position.y
    };
  }
  return { x: 0, y: 0 }; // fallback
}

export function nodeLabel(
  label: string, node: DiagramNodes, anchor = "middle"): JSX.Element {
  const position = getTextPosition(node);
  return <text x={position.x} y={position.y} textAnchor={anchor}>
    {label}
  </text>;
}

export function getConnectionColor(status: boolean | undefined) {
  const colorOk = Color.green;
  const colorError = Color.red;
  const colorUnknown = Color.yellow;
  switch (status) {
    case undefined: return colorUnknown;
    case true: return colorOk;
    default: return colorError;
  }
}

export function getLineProps(
  fromName: DiagramNodes, toName: DiagramNodes): SVGLineCoordinates {
  const fromPosition = diagramPositions[fromName];
  const toPosition = diagramPositions[toName];
  const connectorOffset = { x: 25, y: 20 };
  const x1Sign = toName === "right" ? 1 : -1;
  const y1Sign = fromName === "top" ? 1 : -1;
  const y2Sign = -y1Sign;
  if (fromPosition && toPosition) {
    return {
      x1: fromPosition.x + connectorOffset.x * x1Sign,
      y1: fromPosition.y + connectorOffset.y * y1Sign,
      x2: toPosition.x,
      y2: toPosition.y + connectorOffset.y * y2Sign
    };
  }
  return { x1: 0, y1: 0, x2: 0, y2: 0 }; // fallback
}

export function Connector(props: ConnectorProps): JSX.Element {
  const {
    connectionData, from, to, hover, hoveredConnection, customLineProps
  } = props;
  const lineProps = customLineProps ? customLineProps : getLineProps(from, to);
  const hoverIndicatorColor =
    hoveredConnection === connectionData.connectionName
      ? Color.darkGray
      : Color.white;
  return <g
    id={connectionData.connectionName + "-connector"}
    strokeLinecap="round">
    <line id="connector-border"
      x1={lineProps.x1} y1={lineProps.y1} x2={lineProps.x2} y2={lineProps.y2}
      strokeWidth={9}
      stroke={hoverIndicatorColor}
    />
    <line id="connector-color"
      x1={lineProps.x1} y1={lineProps.y1} x2={lineProps.x2} y2={lineProps.y2}
      strokeWidth={5}
      stroke={getConnectionColor(connectionData.connectionStatus)}
    />
    <line className="connector-hover-area"
      x1={lineProps.x1} y1={lineProps.y1} x2={lineProps.x2} y2={lineProps.y2}
      strokeWidth={40}
      onMouseEnter={hover(connectionData.connectionName)}
      onMouseLeave={hover(undefined)}
    />
  </g>;
}

export function ConnectivityDiagram(props: ConnectivityDiagramProps) {
  const { rowData, hover, hoveredConnection } = props;
  const browserAPI = rowData[0];
  const browserMQTT = rowData[1];
  const botMQTT = rowData[2];
  const botAPI = rowData[3];
  const botFirmware = rowData[4];
  const board = botFirmware.to;
  return <div className="connectivity-diagram">
    <svg
      id="connectivity-diagram"
      width="100%"
      height="100%"
      style={{ maxHeight: "300px" }}
      viewBox="-100 -100 210 220">
      <g className="text"
        dominantBaseline="middle">
        {nodeLabel(t("Browser"), DiagramNodes.browser)}
        {nodeLabel("Web App", DiagramNodes.API)}
        {nodeLabel(t("Message Broker"), DiagramNodes.MQTT)}
        {nodeLabel("FarmBot", DiagramNodes.bot)}
        {nodeLabel("Raspberry Pi", DiagramNodes.RPI, "end")}
        {nodeLabel(board, DiagramNodes.arduino, "start")}
      </g>

      <g className="connections">
        <Connector
          connectionData={browserAPI}
          from={DiagramNodes.browser}
          to={DiagramNodes.API}
          hover={hover}
          hoveredConnection={hoveredConnection} />

        <Connector
          connectionData={browserMQTT}
          from={DiagramNodes.browser}
          to={DiagramNodes.MQTT}
          hover={hover}
          hoveredConnection={hoveredConnection} />

        <Connector
          connectionData={botAPI}
          from={DiagramNodes.bot}
          to={DiagramNodes.API}
          hover={hover}
          hoveredConnection={hoveredConnection} />

        <Connector
          connectionData={botMQTT}
          from={DiagramNodes.bot}
          to={DiagramNodes.MQTT}
          hover={hover}
          hoveredConnection={hoveredConnection} />

        <Connector
          connectionData={botFirmware}
          from={DiagramNodes.bot}
          to={DiagramNodes.arduino}
          customLineProps={{ x1: 0, y1: 110, x2: 30, y2: 110 }}
          hover={hover}
          hoveredConnection={hoveredConnection} />
      </g>
    </svg>
  </div>;
}
