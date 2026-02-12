import React from "react";
import { fireEvent } from "@testing-library/react";
import {
  ConnectivityDiagram,
  ConnectivityDiagramProps,
  ConnectorProps,
  Connector,
  nodeLabel,
  getTextPosition,
  getLineProps,
  DiagramNodes,
  getConnectionColor,
} from "../diagram";
import { Color } from "../../../ui";
import { svgMount } from "../../../__test_support__/svg_mount";

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
};

describe("<ConnectivityDiagram/>", () => {
  beforeEach(() => setWindowWidth(1000));

  function fakeProps(): ConnectivityDiagramProps {
    const hover = jest.fn();
    return {
      rowData: [{
        connectionName: "AB",
        from: "A",
        to: "B",
        connectionStatus: false,
        connectionMsg: "Not connected."
      },
      {
        connectionName: "BC",
        from: "B",
        to: "C",
        connectionStatus: false,
        connectionMsg: "Not connected."
      },
      {
        connectionName: "CD",
        from: "C",
        to: "D",
        connectionStatus: false,
        connectionMsg: "Not connected."
      },
      {
        connectionName: "DE",
        from: "D",
        to: "E",
        connectionStatus: false,
        connectionMsg: "Not connected."
      },
      {
        connectionName: "EF",
        from: "E",
        to: "F",
        connectionStatus: false,
        connectionMsg: "Not connected."
      }],
      hover: hover,
      hoveredConnection: undefined
    };
  }

  it("renders diagram", () => {
    const { container } = svgMount(<ConnectivityDiagram {...fakeProps()} />);
    expect(container.textContent)
      .toContain("This computerWeb AppMessage BrokerFarmBotRaspberry PiF");
  });

  it("renders small diagram", () => {
    setWindowWidth(400);
    const { container } = svgMount(<ConnectivityDiagram {...fakeProps()} />);
    expect(container.textContent)
      .toContain("This phoneWeb AppMessage BrokerFarmBotRaspberry PiF");
  });

  it("hover", () => {
    const p = fakeProps();
    const enterSpy = jest.fn();
    p.hover = jest.fn(() => enterSpy);
    const { container } = svgMount(<ConnectivityDiagram {...p} />);
    const hoverAreas = container.querySelectorAll(".connector-hover-area");
    const target = hoverAreas.item(hoverAreas.length - 1) as SVGLineElement;
    fireEvent.mouseEnter(target);
    expect(p.hover).toHaveBeenCalledWith("EF");
    expect(enterSpy).toHaveBeenCalled();
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
    const { container } = svgMount(nodeLabel("Top Node", "top" as DiagramNodes));
    const text = container.querySelector("text");
    expect(text?.textContent).toEqual("Top Node");
    expect(text?.getAttribute("text-anchor")).toEqual("middle");
    expect(text?.getAttribute("x")).toEqual("0");
    expect(text?.getAttribute("y")).toEqual("-75");
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
    expect(getConnectionColor(undefined)).toEqual(Color.gray);
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
        connectionMsg: "Not connected."
      },
      from: "top" as DiagramNodes,
      to: "left" as DiagramNodes,
      hover: jest.fn(),
      hoveredConnection: undefined
    };
  }

  it("renders", () => {
    const { container } = svgMount(<Connector {...fakeProps()} />);
    const lines = container.querySelectorAll("line");
    expect(lines.length).toEqual(3);
    expect(lines.item(0).getAttribute("id")).toEqual("connector-border");
    expect(lines.item(0).getAttribute("stroke")).toEqual(Color.darkGray);
    expect(lines.item(0).getAttribute("stroke-width")).toEqual("9");
    expect(lines.item(0).getAttribute("x1")).toEqual("-25");
    expect(lines.item(0).getAttribute("x2")).toEqual("-50");
    expect(lines.item(0).getAttribute("y1")).toEqual("-55");
    expect(lines.item(0).getAttribute("y2")).toEqual("-20");
    expect(lines.item(1).getAttribute("id")).toEqual("connector-color");
    expect(lines.item(1).getAttribute("stroke")).toEqual(Color.red);
    expect(lines.item(1).getAttribute("stroke-width")).toEqual("5");
    expect(lines.item(2).getAttribute("class")).toEqual("connector-hover-area");
    expect(lines.item(2).getAttribute("stroke-width")).toEqual("40");
  });

  it("renders connected color", () => {
    const p = fakeProps();
    p.connectionData.connectionStatus = true;
    const { container } = svgMount(<Connector {...p} />);
    expect(container.querySelectorAll("line").item(1).getAttribute("stroke"))
      .toEqual(Color.green);
  });
});
