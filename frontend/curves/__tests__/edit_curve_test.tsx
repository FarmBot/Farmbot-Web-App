import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
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
import * as crud from "../../api/crud";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { error } from "../../toast/toast";
import { SpecialStatus } from "farmbot";
import { Path } from "../../internal_urls";

let overwriteSpy: jest.SpyInstance;
let initSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  initSpy = jest.spyOn(crud, "init")
    .mockImplementation(() => ({ payload: { uuid: "uuid" } } as never));
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  location.pathname = Path.mock(Path.curves(1));
});

afterEach(() => {
  overwriteSpy.mockRestore();
  initSpy.mockRestore();
  saveSpy.mockRestore();
  destroySpy.mockRestore();
});

describe("<EditCurve />", () => {
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
    const { container } = render(<EditCurve {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("redirecting");
    expect(mockNavigate).toHaveBeenCalledWith(Path.curves());
  });

  it("doesn't redirect", () => {
    location.pathname = Path.mock(Path.logs());
    const { container } = render(<EditCurve {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("redirecting");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("renders", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const { container } = render(<EditCurve {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("fake");
    expect(container.textContent?.toLowerCase()).toContain("volume");
    expect(container.textContent?.toLowerCase()).not.toContain("maximum");
  });

  it("renders: data full", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.data = {
      1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
    };
    p.findCurve = () => curve;
    const { container } = render(<EditCurve {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("maximum");
  });

  it("adds data", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    p.findCurve = () => curve;
    const { container } = render(<EditCurve {...p} />);
    const circles = container.querySelectorAll("circle");
    const lastCircle = circles[circles.length - 1];
    lastCircle && fireEvent.click(lastCircle);
    expect(overwriteSpy).toHaveBeenCalledWith(curve, {
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
    const ref = React.createRef<EditCurve>();
    const view = render(<EditCurve {...p} ref={ref} />);
    ref.current?.setState({ uuid: curve.uuid });
    view.unmount();
    expect(saveSpy).toHaveBeenCalledWith(curve.uuid);
  });

  it("doesn't save data: no uuid", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.1.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => curve;
    const ref = React.createRef<EditCurve>();
    const view = render(<EditCurve {...p} ref={ref} />);
    ref.current?.setState({ uuid: undefined });
    view.unmount();
    expect(saveSpy).not.toHaveBeenCalledWith();
  });

  it("doesn't save data: no id", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.0.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => curve;
    const ref = React.createRef<EditCurve>();
    const view = render(<EditCurve {...p} ref={ref} />);
    ref.current?.setState({ uuid: curve.uuid });
    view.unmount();
    expect(saveSpy).not.toHaveBeenCalledWith();
  });

  it("doesn't save data: no curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.uuid = "Curve.1.1";
    curve.body.data = { 1: 0, 10: 10, 100: 1000 };
    curve.specialStatus = SpecialStatus.DIRTY;
    p.findCurve = () => undefined;
    const ref = React.createRef<EditCurve>();
    const view = render(<EditCurve {...p} ref={ref} />);
    ref.current?.setState({ uuid: curve.uuid });
    view.unmount();
    expect(saveSpy).not.toHaveBeenCalledWith();
  });

  it("toggles state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const ref = React.createRef<EditCurve>();
    const { container } = render(<EditCurve {...p} ref={ref} />);
    ref.current?.toggle("scale")();
    expect(container.textContent?.toLowerCase()).toContain("fake");
    expect(container.textContent?.toLowerCase()).toContain("volume");
  });

  it("sets hovered state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    expect(ref.current?.state.hovered).toEqual(undefined);
    act(() => ref.current?.setHovered("1"));
    expect(ref.current?.state.hovered).toEqual("1");
  });

  it("sets maxCount state high", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    expect(ref.current?.state.maxCount).toEqual(41);
    act(() => ref.current?.toggleExpand());
    expect(ref.current?.state.maxCount).toEqual(1000);
  });

  it("sets maxCount state low", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    act(() => ref.current?.setState({ maxCount: 1000 }));
    expect(ref.current?.state.maxCount).toEqual(1000);
    act(() => ref.current?.toggleExpand());
    expect(ref.current?.state.maxCount).toEqual(41);
  });

  it("sets iconDisplay state", () => {
    const p = fakeProps();
    p.findCurve = () => fakeCurve();
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    expect(ref.current?.state.iconDisplay).toEqual(true);
    act(() => ref.current?.toggleIconShow());
    expect(ref.current?.state.iconDisplay).toEqual(false);
  });

  it("renders no icons", () => {
    const p = fakeProps();
    p.findCurve = () => undefined;
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    const { container } = render(<>{ref.current?.UsingThisCurve()}</>);
    expect(container.textContent).toContain("(0)");
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
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    const { container } = render(<>{ref.current?.UsingThisCurve()}</>);
    expect(container.textContent).toContain("(2)");
    expect(container.querySelectorAll("img").length).toEqual(2);
  });

  it("hides icons", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.id = 1;
    const plant0 = fakePlant();
    plant0.body.water_curve_id = 1;
    p.plants = [plant0];
    p.findCurve = () => curve;
    const ref = React.createRef<EditCurve>();
    render(<EditCurve {...p} ref={ref} />);
    act(() => ref.current?.setState({ iconDisplay: false }));
    const { container } = render(<>{ref.current?.UsingThisCurve()}</>);
    expect(container.textContent).toContain("(1)");
    expect(container.querySelectorAll("img").length).toEqual(0);
  });

  it("deletes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    p.findCurve = () => curve;
    const { container } = render(<EditCurve {...p} />);
    const deleteButton = container.querySelector(".fa-trash");
    deleteButton && fireEvent.click(deleteButton);
    expect(destroySpy).toHaveBeenCalledWith(curve.uuid);
  });

  it("handles curve in use", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    p.findCurve = () => curve;
    p.resourceUsage = { [curve.uuid]: true };
    const { container } = render(<EditCurve {...p} />);
    const deleteButton = container.querySelector(".fa-trash");
    deleteButton && fireEvent.click(deleteButton);
    expect(destroySpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith("Curve in use.");
  });

  it("renders spread", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "spread";
    p.findCurve = () => curve;
    const { container } = render(<EditCurve {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("fake");
    expect(container.textContent?.toLowerCase()).toContain("expected spread");
  });

  it("renders height", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "height";
    p.findCurve = () => curve;
    const { container } = render(<EditCurve {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("fake");
    expect(container.textContent?.toLowerCase()).toContain("expected height");
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
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(saveSpy).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("handles promise rejection", async () => {
    const dispatch = jest.fn()
      .mockImplementationOnce(jest.fn())
      .mockImplementationOnce(() => Promise.reject());
    const navigate = jest.fn();
    await copyCurve([], fakeCurve(), navigate)(dispatch, jest.fn())();
    expect(saveSpy).toHaveBeenCalled();
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
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(saveSpy).toHaveBeenCalled();
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
    expect(initSpy).toHaveBeenCalledWith("Curve", {
      ...curve.body,
      name: "Fake copy 2",
      id: undefined,
    });
    expect(saveSpy).toHaveBeenCalled();
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
    const { container } = render(<table><tbody>
      {Object.entries(p.curve.body.data).map((x, i) =>
        curveDataTableRow(p)(x, i))}
    </tbody></table>);
    expect(container.textContent).toEqual("1-2+400%3-80%4+100%");
  });

  it("sets row as active", () => {
    const p = fakeProps();
    p.curve.body.data = { 1: 0, 5: 5 };
    const { container } = render(<table><tbody>
      {curveDataTableRow(p)(["3", 3], 0)}
    </tbody></table>);
    const button = container.querySelector("button");
    button && fireEvent.click(button);
    expect(overwriteSpy).toHaveBeenCalledWith(p.curve, {
      name: "Fake",
      type: "water",
      data: { 1: 0, 3: 3, 5: 5 },
    });
  });

  it("changes value", () => {
    const p = fakeProps();
    p.curve.body.type = "height";
    p.curve.body.data = { 1: 0, 5: 5, 10: 1 };
    const { container } = render(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    const input = container.querySelector("input");
    input && fireEvent.focus(input);
    input && fireEvent.change(input, { target: { value: "6" } });
    input && fireEvent.blur(input, { target: { value: "6" } });
    expect(overwriteSpy).toHaveBeenCalledWith(p.curve, {
      name: "Fake",
      type: "height",
      data: { 1: 0, 5: 6, 10: 1 },
    });
  });

  it("hovers row", () => {
    const p = fakeProps();
    const { container } = render(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    const row = container.querySelector("tr");
    row && fireEvent.mouseEnter(row);
    expect(p.setHovered).toHaveBeenCalledWith("5");
    row && fireEvent.mouseLeave(row);
    expect(p.setHovered).toHaveBeenCalledWith(undefined);
  });

  it("has hover styling", () => {
    const p = fakeProps();
    p.hovered = "5";
    const { container } = render(<table><tbody>
      {curveDataTableRow(p)(["5", 5], 0)}
    </tbody></table>);
    expect(container.querySelector("tr")?.classList.contains("hovered"))
      .toBeTruthy();
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
    const { container } = render(<ScaleMenu {...p} />);
    const inputs = container.querySelectorAll("input");
    const maxValueInput = inputs[0];
    const maxDayInput = inputs[1];
    maxValueInput && fireEvent.change(maxValueInput, { target: { value: "100" } });
    maxValueInput && fireEvent.change(maxValueInput, { target: { value: "" } });
    maxDayInput && fireEvent.change(maxDayInput, { target: { value: "100" } });
    maxDayInput && fireEvent.change(maxDayInput, { target: { value: "" } });
    const button = container.querySelector("button");
    button && fireEvent.click(button);
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
    const { container } = render(<TemplatesMenu {...p} />);
    const inputs = container.querySelectorAll("input");
    const maxValueInput = inputs[0];
    const maxDayInput = inputs[1];
    maxValueInput && fireEvent.change(maxValueInput, { target: { value: "100" } });
    maxValueInput && fireEvent.change(maxValueInput, { target: { value: "" } });
    maxDayInput && fireEvent.change(maxDayInput, { target: { value: "100" } });
    maxDayInput && fireEvent.change(maxDayInput, { target: { value: "" } });
    const buttons = container.querySelectorAll("button");
    const button = buttons[buttons.length - 1];
    button && fireEvent.click(button);
    expect(p.click).toHaveBeenCalled();
  });
});
