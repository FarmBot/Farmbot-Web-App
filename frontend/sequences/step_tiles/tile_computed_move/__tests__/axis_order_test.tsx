let mockDev = false;

import { FBSelect } from "../../../../ui";
import {
  axisOrder, AxisOrderInputRow, getAxisGroupingState, getAxisRouteState,
} from "../axis_order";
import { AxisGrouping, AxisOrderInputRowProps, AxisRoute } from "../interfaces";
import { Move } from "farmbot";
import { DevSettings } from "../../../../settings/dev/dev_support";

let allOrderOptionsEnabledSpy: jest.SpyInstance;

describe("<AxisOrderInputRow />", () => {
  beforeEach(() => {
    mockDev = false;
    allOrderOptionsEnabledSpy = jest.spyOn(DevSettings, "allOrderOptionsEnabled")
      .mockImplementation(() => mockDev);
  });

  afterEach(() => {
    allOrderOptionsEnabledSpy.mockRestore();
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
    [false, undefined, undefined, undefined],
    [false, "x", "low", "x;low"],
    [true, "x", "low", "Safe Z"],
  ])("renders order: safe_z=%s %s %s", (safeZ, grouping, route, label) => {
    const p = fakeProps();
    p.grouping = grouping;
    p.route = route;
    p.safeZ = safeZ;
    const row = AxisOrderInputRow(p);
    const children = row.props.children as JSX.Element[];
    const select = children.find(child => child.type === FBSelect);
    expect(select?.props.selectedItem?.label)
      .toEqual(label);
  });

  it("changes item", () => {
    const p = fakeProps();
    const row = AxisOrderInputRow(p);
    const children = row.props.children as JSX.Element[];
    const select = children.find(child => child.type === FBSelect);
    select?.props.onChange({ label: "X and Y together", value: "xy,z;high" });
    expect(p.onChange).toHaveBeenCalledWith({
      label: "X and Y together",
      value: "xy,z;high",
    });
  });

  it("shows default", () => {
    const p = fakeProps();
    p.defaultValue = "safe_z";
    const row = AxisOrderInputRow(p);
    const children = row.props.children as JSX.Element[];
    const select = children.find(child => child.type === FBSelect);
    expect(select?.props.customNullLabel)
      .toEqual("Use default (Safe Z)");
  });

  it("shows all order options", () => {
    mockDev = true;
    const p = fakeProps();
    const row = AxisOrderInputRow(p);
    const children = row.props.children as JSX.Element[];
    const select = children.find(child => child.type === FBSelect);
    const labels = (select?.props.list || [])
      .map(item => item.label);
    expect(labels).toContain("x,yz;high");
    expect(select?.props.customNullLabel)
      .toEqual("Use default");
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
