import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { RawCurves as Curves, mapStateToProps } from "../curves_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeCurve } from "../../__test_support__/fake_state/resources";
import * as crud from "../../api/crud";
import { Path } from "../../internal_urls";
import { curvesPanelState } from "../../__test_support__/panel_state";
import { CurvesProps } from "../interfaces";
import { Actions } from "../../constants";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

let initSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  initSpy = jest.spyOn(crud, "init")
    .mockImplementation(() => ({ payload: { uuid: "uuid" } } as never));
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
});

afterEach(() => {
  initSpy.mockRestore();
  saveSpy.mockRestore();
});

describe("<Curves> />", () => {
  const fakeProps = (): CurvesProps => ({
    dispatch: jest.fn(),
    curves: [],
    curvesPanelState: curvesPanelState(),
  });

  it("renders no curves", () => {
    const { container } = render(<Curves {...fakeProps()} />);
    expect(container.textContent).toContain("No curves yet.");
  });

  it("renders curves", () => {
    const p = fakeProps();
    const curve0 = fakeCurve();
    curve0.body.id = 1;
    curve0.body.type = "water";
    const curve1 = fakeCurve();
    curve1.body.id = 2;
    curve1.body.type = "spread";
    p.curves = [curve0, curve1];
    p.curvesPanelState.water = true;
    p.curvesPanelState.spread = true;
    const { container } = render(<Curves {...p} />);
    [
      "Water curves (1)",
      "spread curves (1)",
      "height curves (0)",
    ].map(text =>
      expect(container.textContent).toContain(text));
  });

  it("navigates to curves info", () => {
    const p = fakeProps();
    p.curves = [fakeCurve()];
    p.curves[0].body.id = 1;
    p.curvesPanelState.water = true;
    const ref = React.createRef<Curves>();
    const { container } = render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    const item = container.querySelector(".curve-search-item");
    item && fireEvent.click(item);
    expect(navigate).toHaveBeenCalledWith(Path.curves(1));
  });

  it("navigates to unsaved curve", () => {
    const p = fakeProps();
    p.curves = [fakeCurve()];
    p.curves[0].body.id = 0;
    p.curvesPanelState.water = true;
    const ref = React.createRef<Curves>();
    const { container } = render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    const item = container.querySelector(".curve-search-item");
    item && fireEvent.click(item);
    expect(navigate).toHaveBeenCalledWith(Path.curves(0));
  });

  it("filters curves", () => {
    const p = fakeProps();
    p.curves = [fakeCurve(), fakeCurve()];
    p.curves[0].body.name = "curve 0";
    p.curves[1].body.name = "curve 1";
    const { container } = render(<Curves {...p} />);
    const searchInput = container.querySelector("input");
    searchInput && fireEvent.change(searchInput, { target: { value: "0" } });
    expect(container.textContent).not.toContain("curve 1");
  });

  it("toggles section", () => {
    const p = fakeProps();
    const ref = React.createRef<Curves>();
    render(<Curves {...p} ref={ref} />);
    ref.current?.toggleOpen("water")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_CURVES_PANEL_OPTION, payload: "water"
    });
  });

  it("creates new curve: water", async () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "uuid";
    curve.body.id = 1;
    curve.body.name = "Water curve 1";
    p.curves = [curve];
    p.dispatch = jest.fn(() => Promise.resolve());
    const ref = React.createRef<Curves>();
    render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    await ref.current?.addNew("water")();
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      name: "Water curve 2", type: "water",
      data: { 1: 1, 30: 500, 45: 500, 60: 250 },
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(Path.curves(1));
  });

  it("creates new curve: missing curve", async () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "not uuid";
    curve.body.id = 1;
    curve.body.name = "Water curve 1";
    p.curves = [curve];
    p.dispatch = jest.fn(() => Promise.resolve());
    const ref = React.createRef<Curves>();
    render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    await ref.current?.addNew("water")();
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      name: "Water curve 2", type: "water",
      data: { 1: 1, 30: 500, 45: 500, 60: 250 },
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("creates new curve: spread", async () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "uuid";
    curve.body.id = 1;
    p.curves = [curve];
    p.dispatch = jest.fn(() => Promise.resolve());
    const ref = React.createRef<Curves>();
    render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    await ref.current?.addNew("spread")();
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      name: "Spread curve 1", type: "spread",
      data: { 1: 1, 30: 300, 45: 300, 60: 150 },
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(Path.curves(1));
  });

  it("handles curve creation error", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn()
      .mockImplementationOnce(jest.fn())
      .mockImplementationOnce(() => Promise.reject());
    const ref = React.createRef<Curves>();
    render(<Curves {...p} ref={ref} />);
    const navigate = jest.fn();
    if (ref.current) {
      ref.current.navigate = navigate;
    }
    await ref.current?.addNew("water")();
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      name: "Water curve 1", type: "water",
      data: { 1: 1, 30: 500, 45: 500, 60: 250 },
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const curve0 = fakeCurve();
    curve0.body.id = 0;
    const curve1 = fakeCurve();
    curve1.body.id = 1;
    state.resources = buildResourceIndex([curve0, curve1]);
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
    expect(props.curves).toEqual([curve1]);
  });
});
