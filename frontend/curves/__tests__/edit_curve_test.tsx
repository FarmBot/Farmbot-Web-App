jest.mock("../../api/crud", () => ({
  overwrite: jest.fn(),
  init: jest.fn(() => ({ payload: { uuid: "uuid" } })),
  save: jest.fn(),
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
import { fakeCurve, fakePlant } from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { destroy, overwrite, init, save } from "../../api/crud";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { changeBlurableInput } from "../../__test_support__/helpers";
import { error } from "../../toast/toast";
import { SpecialStatus } from "farmbot";
import { Path } from "../../internal_urls";

describe("<EditCurve />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.curves(1));
  });

  const fakeProps = (): EditCurveProps => ({
    dispatch: mockDispatch(),
    findCurve: () => undefined,
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    resourceUsage: {},
    curves: [],
    plants: [],
  });

  it("redirects", () => {
    location.pathname = Path.mock(Path.curves("nope"));
    const wrapper = mount(<EditCurve {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.curves());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const wrapper = mount(<EditCurve {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("redirecting");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("volume");
    expect(wrapper.text().toLowerCase()).not.toContain("maximum");
  });

  it("renders: data full", () => {
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

  it("saves data", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.1.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.setState({ uuid: curve.uuid });
    wrapper.unmount();
    expect(save).toHaveBeenCalledWith(curve.uuid);
  });

  it("doesn't save data: no uuid", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.1.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.setState({ uuid: undefined });
    wrapper.unmount();
    expect(save).not.toHaveBeenCalledWith();
  });

  it("doesn't save data: no id", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.0.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.setState({ uuid: curve.uuid });
    wrapper.unmount();
    expect(save).not.toHaveBeenCalledWith();
  });

  it("doesn't save data: no curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.1.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => undefined;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.setState({ uuid: curve.uuid });
    wrapper.unmount();
    expect(save).not.toHaveBeenCalledWith();
  });

  it("toggles state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    wrapper.instance().toggle("scale")();
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("volume");
  });

  it("sets hovered state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    expect(wrapper.state().hovered).toEqual(undefined);
    wrapper.instance().setHovered("1");
    expect(wrapper.state().hovered).toEqual("1");
  });

  it("sets maxCount state high", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    expect(wrapper.state().maxCount).toEqual(41);
    wrapper.instance().toggleExpand();
    expect(wrapper.state().maxCount).toEqual(1000);
  });

  it("sets maxCount state low", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    wrapper.setState({ maxCount: 1000 });
    expect(wrapper.state().maxCount).toEqual(1000);
    wrapper.instance().toggleExpand();
    expect(wrapper.state().maxCount).toEqual(41);
  });

  it("sets iconDisplay state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    expect(wrapper.state().iconDisplay).toEqual(true);
    wrapper.instance().toggleIconShow();
    expect(wrapper.state().iconDisplay).toEqual(false);
  });

  it("renders no icons", () => {
    const p = fakeProps();
    p.findCurve = () => undefined;
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    const elWrapper = mount(wrapper.instance().UsingThisCurve());
    expect(elWrapper.text()).toContain("(0)");
  });

  it("renders icons", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.id = 1;
    const plant0 = fakePlant();
    plant0.body.water_curve_id = 1;
    const plant1 = fakePlant();
    plant1.body.water_curve_id = 1;
    const plant2 = fakePlant();
    plant2.body.water_curve_id = 2;
    p.plants = [plant0, plant1, plant2];
    p.findCurve = () => curve;
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    const elWrapper = mount(wrapper.instance().UsingThisCurve());
    expect(elWrapper.text()).toContain("(2)");
    expect(elWrapper.find("img").length).toEqual(2);
  });

  it("hides icons", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.id = 1;
    const plant0 = fakePlant();
    plant0.body.water_curve_id = 1;
    p.plants = [plant0];
    p.findCurve = () => curve;
    const wrapper = mount<EditCurve>(<EditCurve {...p} />);
    wrapper.setState({ iconDisplay: false });
    const elWrapper = mount(wrapper.instance().UsingThisCurve());
    expect(elWrapper.text()).toContain("(1)");
    expect(elWrapper.find("img").length).toEqual(0);
  });

  it("deletes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    wrapper.find(".fa-trash").first().simulate("click");
    expect(destroy).toHaveBeenCalledWith(curve.uuid);
  });

  it("handles curve in use", () => {
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
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "spread";
    p.findCurve = () => curve;
    const wrapper = mount(<EditCurve {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("fake");
    expect(wrapper.text().toLowerCase()).toContain("expected spread");
  });

  it("renders height", () => {
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
  it("copies curve", async () => {
    const existingCurve = fakeCurve();
    existingCurve.body.name = "Fake copy 1";
    const curves = [existingCurve];
    const curve = fakeCurve();
    const navigate = jest.fn();
    await copyCurve(curves, curve, navigate)(
      jest.fn(() => Promise.resolve()),
      jest.fn(),
    )();
    expect(init).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(save).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("handles promise rejection", async () => {
    const dispatch = jest.fn()
      .mockImplementationOnce(jest.fn())
      .mockImplementationOnce(() => Promise.reject());
    const navigate = jest.fn();
    await copyCurve([], fakeCurve(), navigate)(dispatch, jest.fn())();
    expect(save).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("copies curve and navigates", async () => {
    const existingCurve = fakeCurve();
    existingCurve.body.name = "Fake copy 1";
    const curves = [existingCurve];
    const curve = fakeCurve();
    curve.uuid = "uuid";
    curve.body.id = 1;
    const state = fakeState();
    state.resources = buildResourceIndex([curve]);
    const navigate = jest.fn();
    await copyCurve(curves, curve, navigate)(
      jest.fn(() => Promise.resolve()),
      () => state,
    )();
    expect(init).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(save).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(Path.curves(1));
  });

  it("copies curve and doesn't navigate", async () => {
    const existingCurve = fakeCurve();
    existingCurve.body.name = "Fake copy 1";
    const curves = [existingCurve];
    const curve = fakeCurve();
    curve.uuid = "not uuid";
    curve.body.id = 1;
    const state = fakeState();
    state.resources = buildResourceIndex([curve]);
    const navigate = jest.fn();
    await copyCurve(curves, curve, navigate)(
      jest.fn(() => Promise.resolve()),
      () => state,
    )();
    expect(init).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(save).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
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
