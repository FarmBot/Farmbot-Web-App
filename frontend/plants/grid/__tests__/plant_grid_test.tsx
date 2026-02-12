jest.mock("../../../api/crud", () => ({
  batchInitDirty: jest.fn(),
}));

import React from "react";
import {
  render, screen, fireEvent, waitFor, act,
} from "@testing-library/react";
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

  const renderGrid = (props: PlantGridProps) => {
    const ref = React.createRef<PlantGrid>();
    const view = render(<PlantGrid ref={ref} {...props} />);
    return { ...view, ref };
  };

  const getToggleButtonByLabel = (label: string): Element => {
    const row = screen.getByText(label).closest(".row");
    const button = row?.querySelector("button");
    if (!button) { throw new Error(`Expected toggle button for ${label}`); }
    return button;
  };

  it("renders", async () => {
    const p = fakeProps();
    const { ref } = renderGrid(p);
    await waitFor(() => expect(batchInitDirty).toHaveBeenCalledTimes(1));
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(ref.current?.state.status).toEqual("dirty");
  });

  it("renders update button", async () => {
    const p = fakeProps();
    const { ref } = renderGrid(p);
    await waitFor(() => expect(batchInitDirty).toHaveBeenCalledTimes(1));
    act(() => {
      ref.current?.setState({ offsetPacking: true });
    });
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Update preview")).toBeInTheDocument();
    expect(ref.current?.state.status).toEqual("dirty");
    expect(screen.queryByText("Save")).not.toBeInTheDocument();
  });

  it("saves a grid", async () => {
    const p = fakeProps();
    p.close = jest.fn();
    const { ref } = renderGrid(p);
    const oldId = ref.current?.state.gridId;
    await ref.current?.saveGrid();
    expect(thunks.saveGrid).toHaveBeenCalledWith(oldId);
    expect(success).toHaveBeenCalledWith("6 plants added.");
    await waitFor(() => expect(ref.current?.state.gridId).not.toEqual(oldId));
    expect(p.close).toHaveBeenCalled();
  });

  it("saves a point grid", async () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const { ref } = renderGrid(p);
    await ref.current?.saveGrid();
    expect(success).toHaveBeenCalledWith("6 points added.");
  });

  it("stashes a grid", async () => {
    const props = fakeProps();
    const { ref } = renderGrid(props);
    const gridId = ref.current?.state.gridId;
    await ref.current?.revertPreview({ setStatus: true })();
    expect(thunks.stashGrid).toHaveBeenCalledWith(gridId);
  });

  it(`prevents creation of grids with > ${MAX_N} plants`, () => {
    const props = fakeProps();
    const { ref } = renderGrid(props);
    act(() => {
      ref.current?.setState({
        grid: {
          ...ref.current.state.grid,
          numPlantsH: MAX_N / 10,
          numPlantsV: 11
        }
      });
    });
    ref.current?.performPreview()();
    expect(error).toHaveBeenCalledWith(
      `Please make a grid with less than ${MAX_N} plants`);
  });

  it(`prevents creation of grids with > ${MAX_N} points`, () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const { ref } = renderGrid(p);
    act(() => {
      ref.current?.setState({
        grid: {
          ...ref.current.state.grid,
          numPlantsH: MAX_N / 10,
          numPlantsV: 11
        }
      });
    });
    ref.current?.performPreview()();
    expect(error).toHaveBeenCalledWith(
      `Please make a grid with less than ${MAX_N} points`);
  });

  it("doesn't perform preview", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    act(() => {
      ref.current?.setState({
        autoPreview: false,
        grid: {
          ...ref.current.state.grid,
          numPlantsH: 10,
          numPlantsV: 11
        },
      });
    });
    ref.current?.performPreview()();
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
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    ref.current?.performPreview()();
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
    const { ref, unmount } = renderGrid(p);
    act(() => {
      ref.current?.setState({ status: "dirty" });
    });
    unmount();
    expect(p.dispatch).toHaveBeenCalledWith("STASH_GRID_MOCK");
  });

  it("handles data changes", () => {
    const props = fakeProps();
    const { ref } = renderGrid(props);
    act(() => {
      ref.current?.onChange("numPlantsH", 6);
    });
    expect(ref.current?.state.grid.numPlantsH).toEqual(6);
    act(() => {
      ref.current?.onChange("numPlantsH", 6);
    });
    expect(ref.current?.state.grid.numPlantsH).toEqual(6);
  });

  it("handles data changes: starting coordinates", () => {
    const props = fakeProps();
    const { ref } = renderGrid(props);
    act(() => {
      ref.current?.onChange("startX", 600);
    });
    expect(ref.current?.state.grid.startX).toEqual(600);
    expect(props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_GRID_START, payload: { x: 600, y: 100 },
    });
  });

  it("uses current position", () => {
    const props = fakeProps();
    const { ref } = renderGrid(props);
    expect(ref.current?.state.grid.startX).toEqual(100);
    expect(ref.current?.state.grid.startY).toEqual(100);
    act(() => {
      ref.current?.onUseCurrentPosition({ x: 1, y: 2 });
    });
    expect(ref.current?.state.grid.startX).toEqual(1);
    expect(ref.current?.state.grid.startY).toEqual(2);
  });

  it("toggles packing method on", () => {
    const p = fakeProps();
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    expect(ref.current?.state.offsetPacking).toBeFalsy();
    fireEvent.click(getToggleButtonByLabel("hexagonal packing"));
    expect(ref.current?.state.offsetPacking).toBeTruthy();
    expect(ref.current?.state.grid.spacingH).toEqual(217);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles packing method off", () => {
    const p = fakeProps();
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    act(() => {
      ref.current?.setState({ offsetPacking: true });
    });
    expect(ref.current?.state.offsetPacking).toBeTruthy();
    fireEvent.click(getToggleButtonByLabel("hexagonal packing"));
    expect(ref.current?.state.offsetPacking).toBeFalsy();
    expect(ref.current?.state.grid.spacingH).toEqual(250);
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles camera view on", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    expect(ref.current?.state.cameraView).toBeFalsy();
    fireEvent.click(getToggleButtonByLabel("camera view area"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: ref.current?.state.gridId,
    });
    expect(ref.current?.state.cameraView).toBeTruthy();
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("toggles camera view off", () => {
    const p = fakeProps();
    p.openfarm_slug = undefined;
    const { ref } = renderGrid(p);
    jest.clearAllMocks();
    act(() => {
      ref.current?.setState({ cameraView: true });
    });
    fireEvent.click(getToggleButtonByLabel("camera view area"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SHOW_CAMERA_VIEW_POINTS,
      payload: undefined,
    });
    expect(ref.current?.state.cameraView).toBeFalsy();
    expect(batchInitDirty).toHaveBeenCalledTimes(1);
  });

  it("collapses", () => {
    const p = fakeProps();
    p.collapsible = true;
    const { container, ref } = renderGrid(p);
    jest.clearAllMocks();
    expect(ref.current?.state.isOpen).toBeFalsy();
    const chevronDown = container.querySelector(".fa-chevron-down");
    expect(chevronDown).toBeInTheDocument();
    fireEvent.click(chevronDown as Element);
    expect(ref.current?.state.isOpen).toBeTruthy();
    const chevronUp = container.querySelector(".fa-chevron-up");
    expect(chevronUp).toBeInTheDocument();
    fireEvent.click(chevronUp as Element);
    expect(ref.current?.state.isOpen).toBeFalsy();
  });
});
