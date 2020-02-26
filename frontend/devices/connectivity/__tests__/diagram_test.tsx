import * as React from "react";
import {
  ConnectivityDiagram,
  ConnectivityDiagramProps,
  ConnectorProps,
  Connector,
  nodeLabel,
  getTextPosition,
  getLineProps,
  DiagramNodes,
  getConnectionColor
} from "../diagram";
import { Color } from "../../../ui/index";
import { svgMount } from "../../../__test_support__/svg_mount";

describe("<ConnectivityDiagram/>", () => {
  function fakeProps(): ConnectivityDiagramProps {
    const hover = jest.fn();
    return {
      rowData: [{
        connectionName: "AB",
        from: "A",
        to: "B",
        connectionStatus: false,
        children: "Not connected."
      },
      {
        connectionName: "BC",
        from: "B",
        to: "C",
        connectionStatus: false,
        children: "Not connected."
      },
      {
        connectionName: "CD",
        from: "C",
        to: "D",
        connectionStatus: false,
        children: "Not connected."
      },
      {
        connectionName: "DE",
        from: "D",
        to: "E",
        connectionStatus: false,
        children: "Not connected."
      },
      {
        connectionName: "EF",
        from: "E",
        to: "F",
        connectionStatus: false,
        children: "Not connected."
      }],
      hover: hover,
      hoveredConnection: undefined
    };
  }

  it("renders diagram", () => {
    const wrapper = svgMount(<ConnectivityDiagram {...fakeProps()} />);
    expect(wrapper.text())
      .toContain("BrowserWeb AppMessage BrokerFarmBotRaspberry PiF");
  });

  it("hover", () => {
    const p = fakeProps();
    const wrapper = svgMount(<ConnectivityDiagram {...p} />);
    wrapper.find(".connector-hover-area").first().simulate("mouseEnter");
    expect(p.hover).toHaveBeenCalledWith("EF");
  });
});

describe("getTextPosition()", () => {
  it("returns coordinates", () => {
    expect(getTextPosition("top" as DiagramNodes)).toEqual({ x: 0, y: -75 });
  });
  it("returns fallback", () => {
    expect(getTextPosition("na" as DiagramNodes)).toEqual({ x: 0, y: 0 });
  });
});

describe("nodeLabel()", () => {
  it("renders", () => {
    const label = svgMount(nodeLabel("Top Node", "top" as DiagramNodes));
    expect(label.find("text").text()).toEqual("Top Node");
    expect(label.find("text").props())
      .toEqual({ children: "Top Node", textAnchor: "middle", x: 0, y: -75 });
  });
});

describe("getLineProps()", () => {
  it("returns coordinates", () => {
    expect(getLineProps("bottom" as DiagramNodes, "left" as DiagramNodes))
      .toEqual({ x1: -25, x2: -50, y1: 55, y2: 20 });
  });
  it("returns fallback", () => {
    expect(getLineProps("na" as DiagramNodes, "na" as DiagramNodes))
      .toEqual({ x1: 0, x2: 0, y1: 0, y2: 0 });
  });
});

describe("getConnectionColor()", () => {
  it("unknown", () => {
    expect(getConnectionColor(undefined)).toEqual(Color.yellow);
  });
  it("error", () => {
    expect(getConnectionColor(false)).toEqual(Color.red);
  });
  it("ok", () => {
    expect(getConnectionColor(true)).toEqual(Color.green);
  });
});

describe("<Connector/>", () => {
  function fakeProps(): ConnectorProps {
    return {
      connectionData: {
        connectionName: "AB",
        from: "A",
        to: "B",
        connectionStatus: false,
        children: "Not connected."
      },
      from: "top" as DiagramNodes,
      to: "left" as DiagramNodes,
      hover: jest.fn(),
      hoveredConnection: undefined
    };
  }

  it("renders", () => {
    const wrapper = svgMount(<Connector {...fakeProps()} />);
    const lines = wrapper.find("line");
    expect(lines.length).toEqual(3);
    expect(lines.at(0).props())
      .toEqual({
        id: "connector-border", stroke: Color.white, strokeWidth: 9,
        x1: -25, x2: -50, y1: -55, y2: -20
      });
    expect(lines.at(1).props())
      .toEqual({
        id: "connector-color", stroke: Color.red, strokeWidth: 5,
        x1: -25, x2: -50, y1: -55, y2: -20
      });
    expect(lines.at(2).props())
      .toEqual({
        className: "connector-hover-area",
        onMouseEnter: undefined, onMouseLeave: undefined, strokeWidth: 40,
        x1: -25, x2: -50, y1: -55, y2: -20
      });
  });

  it("renders connected color", () => {
    const p = fakeProps();
    p.connectionData.connectionStatus = true;
    const wrapper = svgMount(<Connector {...p} />);
    expect(wrapper.find("line").at(1).props().stroke).toEqual(Color.green);
  });
});
