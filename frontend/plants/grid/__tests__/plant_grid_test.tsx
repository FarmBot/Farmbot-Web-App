jest.mock("../../../api/crud", () => ({
  batchInitDirty: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { MAX_N, PlantGrid } from "../plant_grid";
import * as thunks from "../thunks";
import { error, success } from "../../../toast/toast";
import { PlantGridProps } from "../interfaces";
import { batchInitDirty } from "../../../api/crud";
import { Actions } from "../../../constants";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

afterAll(() => {
  jest.unmock("../../../api/crud");
});
describe("<PlantGrid />", () => {
  let saveGridSpy: jest.SpyInstance;
  let stashGridSpy: jest.SpyInstance;

  beforeEach(() => {
    console.debug = jest.fn();
    saveGridSpy = jest.spyOn(thunks, "saveGrid")
      .mockImplementation(() => "SAVE_GRID_MOCK" as never);
    stashGridSpy = jest.spyOn(thunks, "stashGrid")
      .mockImplementation(() => "STASH_GRID_MOCK" as never);
  });

  afterEach(() => {
    saveGridSpy.mockRestore();
    stashGridSpy.mockRestore();
  });

  const fakeProps = (): PlantGridProps => ({
    xy_swap: true,
    openfarm_slug: "beets",
    itemName: "Beets",
    dispatch: jest.fn(() => Promise.resolve({})),
    botPosition: { x: undefined, y: undefined, z: undefined },
    spread: undefined,
    z: 0,
  });

  it("renders", () => {
    const p = fakeProps();
    const el = mount<PlantGrid>(<PlantGrid {...p} />);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
    const cancel = el.find("a.cancel-button");
    const save = el.find("a.save-button");
    expect(cancel.text()).toContain("Cancel");
    expect(save.text()).toContain("Save");
    expect(el.state().status).toEqual("dirty");
  });

  it("renders update button", () => {
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
    wrapper.setState({ offsetPacking: true });
    const cancel = wrapper.find("a.cancel-button");
    const update = wrapper.find("a.update-button");
    expect(cancel.text()).toContain("Cancel");
    expect(update.text()).toContain("Update");
    expect(wrapper.state().status).toEqual("dirty");
    expect(wrapper.text()).not.toContain("save");
    expect(wrapper.find("a.save-button").length).toEqual(0);
  });

  it("saves a grid", async () => {
    const p = fakeProps();
    p.close = jest.fn();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />).instance();
    const oldId = wrapper.state.gridId;
    await wrapper.saveGrid();
    expect(thunks.saveGrid).toHaveBeenCalledWith(oldId);
    expect(success).toHaveBeenCalledWith("6 plants added.");
    expect(wrapper.state.gridId).not.toEqual(oldId);
    expect(p.close).toHaveBeenCalled();
  });

  it("saves a point grid", async () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    await wrapper.instance().saveGrid();
    expect(success).toHaveBeenCalledWith("6 points added.");
  });

  it("stashes a grid", async () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    await wrapper.instance().revertPreview({ setStatus: true })();
    expect(thunks.stashGrid).toHaveBeenCalledWith(wrapper.state().gridId);
  });

  it(`prevents creation of grids with > ${MAX_N} plants`, () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    wrapper.setState({
      grid: {
        ...wrapper.state().grid,
        numPlantsH: MAX_N / 10,
        numPlantsV: 11
      }
    });
    wrapper.instance().performPreview()();
    expect(error).toHaveBeenCalledWith(
      `Please make a grid with less than ${MAX_N} plants`);
  });

  it(`prevents creation of grids with > ${MAX_N} points`, () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({
      grid: {
        ...wrapper.state().grid,
        numPlantsH: MAX_N / 10,
        numPlantsV: 11
      }
    });
    wrapper.instance().performPreview()();
    expect(error).toHaveBeenCalledWith(
      `Please make a grid with less than ${MAX_N} points`);
  });

  it("doesn't perform preview", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    wrapper.setState({
      autoPreview: false,
      grid: {
        ...wrapper.state().grid,
        numPlantsH: 10,
        numPlantsV: 11
      },
    });
    wrapper.instance().performPreview()();
    expect(error).not.toHaveBeenCalled();
    expect(batchInitDirty).not.toHaveBeenCalled();
  });

  it("performs preview", () => {
    const p = fakeProps();
    p.openfarm_slug = "beet";
    const designer = fakeDesignerState();
    designer.cropRadius = 100;
    designer.cropStage = "planted";
    designer.cropPlantedAt = "2020-01-20T20:00:00.000Z";
    designer.cropWaterCurveId = 1;
    designer.cropSpreadCurveId = 2;
    designer.cropHeightCurveId = 3;
    p.designer = designer;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    wrapper.instance().performPreview()();
    expect(error).not.toHaveBeenCalled();
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
    expect(batchInitDirty).toHaveBeenCalledWith("Point",
      expect.arrayContaining([expect.objectContaining({
        plant_stage: "planted",
        planted_at: "2020-01-20T20:00:00.000Z",
        water_curve_id: 1,
        spread_curve_id: 2,
        height_curve_id: 3,
      })]));
  });

  it("discards unsaved changes", () => {
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    wrapper.setState({ status: "dirty" });
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith("STASH_GRID_MOCK");
  });

  it("handles data changes", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    wrapper.instance().onChange("numPlantsH", 6);
    expect(wrapper.state().grid.numPlantsH).toEqual(6);
    wrapper.instance().onChange("numPlantsH", 6);
    expect(wrapper.state().grid.numPlantsH).toEqual(6);
  });

  it("handles data changes: starting coordinates", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    wrapper.instance().onChange("startX", 600);
    expect(wrapper.state().grid.startX).toEqual(600);
    expect(props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_START, payload: { x: 600, y: 100 },
    });
  });

  it("uses current position", () => {
    const props = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...props} />);
    expect(wrapper.state().grid.startX).toEqual(100);
    expect(wrapper.state().grid.startY).toEqual(100);
    wrapper.instance().onUseCurrentPosition({ x: 1, y: 2 });
    expect(wrapper.state().grid.startX).toEqual(1);
    expect(wrapper.state().grid.startY).toEqual(2);
  });

  it("toggles packing method on", () => {
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    expect(wrapper.state().offsetPacking).toBeFalsy();
    wrapper.find('[title="toggle packing method"]')
      .first().simulate("click");
    expect(wrapper.state().offsetPacking).toBeTruthy();
    expect(wrapper.state().grid.spacingH).toEqual(217);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles packing method off", () => {
    const p = fakeProps();
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    wrapper.setState({ offsetPacking: true });
    expect(wrapper.state().offsetPacking).toBeTruthy();
    wrapper.find('[title="toggle packing method"]')
      .first().simulate("click");
    expect(wrapper.state().offsetPacking).toBeFalsy();
    expect(wrapper.state().grid.spacingH).toEqual(250);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles camera view on", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    expect(wrapper.state().cameraView).toBeFalsy();
    wrapper.find('[title="show camera view area"]')
      .first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: wrapper.state().gridId,
    });
    expect(wrapper.state().cameraView).toBeTruthy();
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles camera view off", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    wrapper.setState({ cameraView: true });
    wrapper.find('[title="show camera view area"]')
      .first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: undefined,
    });
    expect(wrapper.state().cameraView).toBeFalsy();
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("collapses", () => {
    const p = fakeProps();
    p.collapsible = true;
    const wrapper = mount<PlantGrid>(<PlantGrid {...p} />);
    jest.clearAllMocks();
    expect(wrapper.state().isOpen).toBeFalsy();
    const chevronDown = wrapper.find("i").first();
    expect(chevronDown.hasClass("fa-chevron-down")).toBeTruthy();
    chevronDown.simulate("click");
    expect(wrapper.state().isOpen).toBeTruthy();
    const chevronUp = wrapper.find("i").first();
    expect(chevronUp.hasClass("fa-chevron-up")).toBeTruthy();
    chevronUp.simulate("click");
    expect(wrapper.state().isOpen).toBeFalsy();
  });
});
