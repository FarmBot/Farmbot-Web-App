import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.curves(1));
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

jest.mock("../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
  initSaveGetId: jest.fn(),
  destroy: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditCurve as EditCurve,
  mapStateToProps,
  curveDataTableRow,
  copyCurve,
  ScaleMenu,
  TemplatesMenu,
} from "../edit_curve";
import {
  ActionMenuProps, CurveDataTableRowProps, EditCurveProps,
} from "../interfaces";
import { fakeState } from "../../__test_support__/fake_state";
import { fakeCurve } from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { destroy, overwrite, initSaveGetId } from "../../api/crud";
import { push } from "../../history";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { changeBlurableInput } from "../../__test_support__/helpers";
import { error } from "../../toast/toast";

describe("<EditCurve />", () => {
  const fakeProps = (): EditCurveProps => ({
    dispatch: mockDispatch(),
    findCurve: () => undefined,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    resourceUsage: {},
  });

  it("redirects", () => {
    mockPath = Path.mock(Path.curves("nope"));
    const wrapper = mount(<EditCurve {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).toHaveBeenCalledWith(Path.curves());
  });

  it("doesn't redirect", () => {
    mockPath = Path.mock(Path.logs());
    const wrapper = mount(<EditCurve {...fakeProps()} />);
    expect(wrapper.text()).toContain("Redirecting...");
    expect(push).not.toHaveBeenCalled();
  });

  it("renders", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("volume");
    expect(wrapper.text().toLowerCase()).not.toContain("maximum");
  });

  it("renders: data full", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.data = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
    };
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("maximum");
  });

  it("adds data", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.find("circle").last().simulate("click");
    expect(overwrite).toHaveBeenCalledWith(curve, {
      name: "Fake",
      type: "water",
      data: { 1: 0, 10: 10, 99: 989, 100: 1000 },
    });
  });

  it("toggles state", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    wrapper.instance().toggle("scale")();
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("volume");
  });

  it("sets hovered state", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    expect(wrapper.state().hovered).toEqual(undefined);
    wrapper.instance().setHovered("1");
    expect(wrapper.state().hovered).toEqual("1");
  });

  it("deletes curve", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    const curve = fakeCurve();
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(curve.uuid);
  });

  it("handles curve in use", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    const curve = fakeCurve();
    p.findCurve = () => curve;
    p.resourceUsage = { [curve.uuid]: true };
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Curve in use.");
  });

  it("renders spread", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "spread";
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("expected spread");
  });

  it("renders height", () => {
    mockPath = Path.mock(Path.curves(1));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "height";
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("expected height");
  });
});

describe("copyCurve()", () => {
  it("copies curve", () => {
    const curve = fakeCurve();
    copyCurve(curve, jest.fn(() => Promise.resolve()))();
    expect(initSaveGetId).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy",
      id: 1,
    });
    copyCurve(curve, jest.fn(() => Promise.reject()))();
  });
});

describe("curveDataTableRow()", () => {
  const fakeProps = (): CurveDataTableRowProps => ({
    dispatch: mockDispatch(),
    curve: fakeCurve(),
    hovered: undefined,
    setHovered: jest.fn(),
  });

  it("renders percents", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.curve.body.data = { 1: 1, 2: 5, 3: 1, 4: 2 };
    const wrapper = mount(<table><tbody>
      {Object.entries(p.curve.body.data).map((x, i) =>
        curveDataTableRow(p)(x, i))}
    </tbody></table>);
    expect(wrapper.text()).toEqual("1-2+400%3-80%4+100%");
  });

  it("sets row as active", () => {
    const p = fakeProps();
    p.curve.body.data = { 1: 0, 5: 5 };
    const wrapper = mount(<table><tbody>
      {curveDataTableRow(p)(["3", 3], 0)}
    </tbody></table>);
    wrapper.find("button").first().simulate("click");
    expect(overwrite).toHaveBeenCalledWith(p.curve, {
      name: "Fake",
      type: "water",
      data: { 1: 0, 3: 3, 5: 5 },
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.curve.body.data = { 1: 0, 5: 5, 10: 1 };
    const wrapper = mount(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    changeBlurableInput(wrapper, "6", 0);
    expect(overwrite).toHaveBeenCalledWith(p.curve, {
      name: "Fake",
      type: "height",
      data: { 1: 0, 5: 6, 10: 1 },
    });
  });

  it("hovers row", () => {
    const p = fakeProps();
    const wrapper = mount(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    wrapper.find("tr").first().simulate("mouseEnter");
    expect(p.setHovered).toHaveBeenCalledWith("5");
    wrapper.find("tr").first().simulate("mouseLeave");
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
  });

  it("has hover styling", () => {
    const p = fakeProps();
    p.hovered = "5";
    const wrapper = mount(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    expect(wrapper.find("tr").hasClass("hovered")).toBeTruthy();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeCurve()]);
    const props = mapStateToProps(state);
    expect(props.findCurve(1)).toEqual(undefined);
  });
});

describe("<ScaleMenu />", () => {
  const fakeProps = (): ActionMenuProps => ({
    dispatch: jest.fn(),
    curve: fakeCurve(),
    click: jest.fn(),
  });

  it("changes curve", () => {
    const p = fakeProps();
    const wrapper = shallow(<ScaleMenu {...p} />);
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "100" } });
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "" } });
    wrapper.find("input").last().simulate("change",
      { currentTarget: { value: "100" } });
    wrapper.find("input").last().simulate("change",
      { currentTarget: { value: "" } });
    wrapper.find("button").last().simulate("click");
    expect(p.click).toHaveBeenCalled();
  });
});

describe("<TemplatesMenu />", () => {
  const fakeProps = (): ActionMenuProps => ({
    dispatch: jest.fn(),
    curve: fakeCurve(),
    click: jest.fn(),
  });

  it("changes curve", () => {
    const p = fakeProps();
    const wrapper = shallow(<TemplatesMenu {...p} />);
    wrapper.find("FBSelect").first().simulate("change",
      { label: "", value: "linear" });
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "100" } });
    wrapper.find("input").first().simulate("change",
      { currentTarget: { value: "" } });
    wrapper.find("input").last().simulate("change",
      { currentTarget: { value: "100" } });
    wrapper.find("input").last().simulate("change",
      { currentTarget: { value: "" } });
    wrapper.find("button").last().simulate("click");
    expect(p.click).toHaveBeenCalled();
  });
});
