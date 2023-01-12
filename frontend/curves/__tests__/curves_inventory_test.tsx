jest.mock("../../api/crud", () => ({ initSaveGetId: jest.fn() }));

import React from "react";
import { mount } from "enzyme";
import { RawCurves as Curves, mapStateToProps } from "../curves_inventory";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeCurve } from "../../__test_support__/fake_state/resources";
import { push } from "../../history";
import { initSaveGetId } from "../../api/crud";
import { SearchField } from "../../ui/search_field";
import { Path } from "../../internal_urls";
import { curvesPanelState } from "../../__test_support__/panel_state";
import { CurvesProps } from "../interfaces";
import { Actions } from "../../constants";

describe("<Curves> />", () => {
  const fakeProps = (): CurvesProps => ({
    dispatch: jest.fn(),
    curves: [],
    curvesPanelState: curvesPanelState(),
  });

  it("renders no curves", () => {
    const wrapper = mount(<Curves {...fakeProps()} />);
    expect(wrapper.text()).toContain("No curves yet.");
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
    const wrapper = mount(<Curves {...p} />);
    [
      "Water curves (1)",
      "spread curves (1)",
      "height curves (0)",
    ].map(text =>
      expect(wrapper.text()).toContain(text));
  });

  it("navigates to curves info", () => {
    const p = fakeProps();
    p.curves = [fakeCurve()];
    p.curves[0].body.id = 1;
    p.curvesPanelState.water = true;
    const wrapper = mount(<Curves {...p} />);
    wrapper.find(".curve-search-item").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.curves(1));
  });

  it("navigates to unsaved curve", () => {
    const p = fakeProps();
    p.curves = [fakeCurve()];
    p.curves[0].body.id = 0;
    p.curvesPanelState.water = true;
    const wrapper = mount(<Curves {...p} />);
    wrapper.find(".curve-search-item").first().simulate("click");
    expect(push).toHaveBeenCalledWith(Path.curves(0));
  });

  it("filters curves", () => {
    const p = fakeProps();
    p.curves = [fakeCurve(), fakeCurve()];
    p.curves[0].body.name = "curve 0";
    p.curves[1].body.name = "curve 1";
    const wrapper = mount(<Curves {...p} />);
    wrapper.find(SearchField).props().onChange("0");
    expect(wrapper.text()).not.toContain("curve 1");
  });

  it("toggles section", () => {
    const p = fakeProps();
    const wrapper = mount<Curves>(<Curves {...p} />);
    wrapper.instance().toggleOpen("water")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_CURVES_PANEL_OPTION, payload: "water"
    });
  });

  it("creates new curve: water", async () => {
    const p = fakeProps();
    p.curves = [fakeCurve()];
    p.dispatch = jest.fn(() => Promise.resolve(1));
    const wrapper = mount<Curves>(<Curves {...p} />);
    await wrapper.instance().addNew("water")();
    expect(initSaveGetId).toHaveBeenCalledWith("Curve", {
      name: "Water curve 2", type: "water",
      data: { 1: 250, 30: 500, 45: 500, 60: 250 },
      id: 2,
    });
    expect(push).toHaveBeenCalledWith(Path.curves(1));
  });

  it("creates new curve: spread", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve(1));
    const wrapper = mount<Curves>(<Curves {...p} />);
    await wrapper.instance().addNew("spread")();
    expect(initSaveGetId).toHaveBeenCalledWith("Curve", {
      name: "Spread curve 1", type: "spread",
      data: { 1: 150, 30: 300, 45: 300, 60: 150 },
      id: 1,
    });
    expect(push).toHaveBeenCalledWith(Path.curves(1));
  });

  it("handles curve creation error", async () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.reject());
    const wrapper = mount<Curves>(<Curves {...p} />);
    await wrapper.instance().addNew("water")();
    expect(initSaveGetId).toHaveBeenCalledWith("Curve", {
      name: "Water curve 1", type: "water",
      data: { 1: 250, 30: 500, 45: 500, 60: 250 },
      id: 1,
    });
    expect(push).not.toHaveBeenCalled();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const props = mapStateToProps(state);
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
