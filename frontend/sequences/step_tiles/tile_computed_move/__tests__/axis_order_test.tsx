let mockDev = false;

jest.unmock("../../../../ui");

import React from "react";
import { render } from "@testing-library/react";
import {
  axisOrder, AxisOrderInputRow, getAxisGroupingState, getAxisRouteState,
} from "../axis_order";
import { AxisGrouping, AxisOrderInputRowProps, AxisRoute } from "../interfaces";
import { Move } from "farmbot";
import { DevSettings } from "../../../../settings/dev/dev_support";
import * as ui from "../../../../ui";
import { FBSelectProps } from "../../../../ui";

let allOrderOptionsEnabledSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance | undefined;
let fbSelectProps: FBSelectProps | undefined;

const renderAxisOrder = (p: AxisOrderInputRowProps) => {
  fbSelectProps = undefined;
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation((props: FBSelectProps) => {
      fbSelectProps = props;
      return <div />;
    });
  const renderResult = render(<AxisOrderInputRow {...p} />);
  if (!fbSelectProps) {
    throw new Error("Expected FBSelect to be rendered");
  }
  return renderResult;
};

const restoreFbSelect = () => {
  fbSelectSpy?.mockRestore();
  fbSelectSpy = undefined;
  fbSelectProps = undefined;
};

const getSelectedLabel = () => (fbSelectProps?.selectedItem?.label
  || fbSelectProps?.customNullLabel
  || "Use default").trim();

describe("<AxisOrderInputRow />", () => {
  beforeEach(() => {
    mockDev = false;
    allOrderOptionsEnabledSpy = jest.spyOn(DevSettings, "allOrderOptionsEnabled")
      .mockImplementation(() => mockDev);
  });

  afterEach(() => {
    allOrderOptionsEnabledSpy.mockRestore();
    restoreFbSelect();
  });

  const fakeProps = (): AxisOrderInputRowProps => ({
    grouping: undefined,
    route: undefined,
    safeZ: false,
    onChange: jest.fn(),
  });

  it.each<[boolean, AxisGrouping, AxisRoute, string | undefined]>([
    [false, "x,y,z", "high", "One at a time"],
    [false, "xy,z", "high", "X and Y together"],
    [false, "xyz", "high", "All at once"],
    [false, undefined, undefined, "Use default"],
    [false, "x", "low", "x;low"],
    [true, "x", "low", "Safe Z"],
  ])("renders order: safe_z=%s %s %s", (safeZ, grouping, route, label) => {
    const p = fakeProps();
    p.grouping = grouping;
    p.route = route;
    p.safeZ = safeZ;
    renderAxisOrder(p);
    expect(getSelectedLabel()).toEqual(label || "Use default");
  });

  it("changes item", () => {
    const p = fakeProps();
    renderAxisOrder(p);
    expect(fbSelectProps?.onChange).toBeDefined();
    fbSelectProps?.onChange({
      label: "X and Y together",
      value: "xy,z;high",
      isNull: false,
    });
    expect(p.onChange).toHaveBeenCalledWith({
      label: "X and Y together",
      value: "xy,z;high",
      isNull: false,
    });
  });

  it("shows default", () => {
    const p = fakeProps();
    p.defaultValue = "safe_z";
    renderAxisOrder(p);
    expect(getSelectedLabel()).toContain("Safe Z");
  });

  it("shows all order options", () => {
    mockDev = true;
    const p = fakeProps();
    renderAxisOrder(p);
    expect(fbSelectProps?.list?.find(item => item.value == "x,yz;high"))
      .toBeTruthy();
    expect(getSelectedLabel()).toEqual("Use default");
  });
});

describe("axisOrder()", () => {
  it("returns node list", () => {
    expect(axisOrder(undefined, undefined)).toEqual([]);
    expect(axisOrder("xyz", "in_order")).toEqual([
      { kind: "axis_order", args: { grouping: "xyz", route: "in_order" } },
    ]);
  });
});

describe("getAxisGroupingState()", () => {
  it("returns state: axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [
        { kind: "axis_order", args: { grouping: "z,y,x", route: "in_order" } },
      ],
    };
    expect(getAxisGroupingState(move)).toEqual("z,y,x");
  });

  it("returns state: no axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [],
    };
    expect(getAxisGroupingState(move)).toEqual(undefined);
  });
});

describe("getAxisRouteState()", () => {
  it("returns state: axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [
        { kind: "axis_order", args: { grouping: "z,y,x", route: "in_order" } },
      ],
    };
    expect(getAxisRouteState(move)).toEqual("in_order");
  });

  it("returns state: no axis order", () => {
    const move: Move = {
      kind: "move",
      args: {},
      body: [],
    };
    expect(getAxisRouteState(move)).toEqual(undefined);
  });
});
