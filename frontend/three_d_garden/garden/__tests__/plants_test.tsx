interface MockRef {
  current: {
    scale: { set: Function; };
    position: { z: number; };
    rotation?: { z: number; };
  } | undefined;
}
const mockRef = (): MockRef => ({
  current: {
    scale: { set: jest.fn() },
    position: { z: 0 },
    rotation: { z: 0 },
  }
});
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: mockRef,
}));

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { clone } from "lodash";
import { fakePlant } from "../../../__test_support__/fake_state/resources";
import { INITIAL } from "../../config";
import { ThreeDPlant, ThreeDPlantProps } from "../plants";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import { mockDispatch } from "../../../__test_support__/fake_dispatch";
import { convertPlants } from "../../../farm_designer/three_d_garden_map";
import { fakeMovementState } from "../../../__test_support__/fake_bot_data";
import * as spreadHelper from
  "../../../farm_designer/map/layers/spread/spread_overlap_helper";

describe("<ThreeDPlant />", () => {
  beforeEach(() => {
    location.pathname = Path.mock(Path.designer());
  });
  afterEach(() => {
    document.querySelector(".garden-bed-3d-model")?.remove();
  });

  const setupGardenBed = () => {
    const bed = document.createElement("div");
    bed.className = "garden-bed-3d-model";
    document.body.appendChild(bed);
    return bed;
  };

  const fakeProps = (): ThreeDPlantProps => {
    const config = clone(INITIAL);
    const plant = fakePlant();
    plant.body.name = "Beet";
    plant.body.id = 1;
    const otherPlant = fakePlant();
    otherPlant.body.id = 2;
    return {
      plant: convertPlants(config, [plant])[0],
      i: 0,
      config: config,
      hoveredPlant: undefined,
      visible: true,
      getZ: () => 0,
      activePositionRef: { current: { x: 0, y: 0 } },
      plants: convertPlants(config, [plant, otherPlant]),
    };
  };

  it("renders name popup on hover", () => {
    const p = fakeProps();
    p.config.labels = true;
    p.config.labelsOnHover = true;
    p.hoveredPlant = 0;
    p.popupActions = {
      updatePlant: jest.fn(),
      onDelete: jest.fn(),
      dispatch: jest.fn(),
      botOnline: true,
      arduinoBusy: false,
      currentBotLocation: { x: 0, y: 0, z: 0 },
      movementState: fakeMovementState(),
      defaultAxes: "XY",
    };
    p.showHoverLabel = true;
    render(<ThreeDPlant {...p} />);
    expect(screen.getByText("Beet")).toBeInTheDocument();
  });

  it("renders expanded popup on selection", () => {
    const p = fakeProps();
    p.popupActions = {
      updatePlant: jest.fn(),
      onDelete: jest.fn(),
      dispatch: jest.fn(),
      botOnline: true,
      arduinoBusy: false,
      currentBotLocation: { x: 0, y: 0, z: 0 },
      movementState: fakeMovementState(),
      defaultAxes: "XY",
    };
    p.selectedPlantUuid = p.plant.uuid;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container.querySelector(".plant-popup.expanded")).toBeTruthy();
    expect(container.querySelector(".fa-external-link")).toBeTruthy();
    expect(container.querySelector(".fa-trash")).toBeTruthy();
    const popupBody = container.querySelector(".plant-popup-body");
    expect(popupBody?.getAttribute("aria-hidden")).toEqual("false");
  });

  it("renders selection ring when selected", () => {
    const p = fakeProps();
    p.selectedPlantUuid = p.plant.uuid;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container.querySelector("[name='plant-selection-ring']"))
      .toBeTruthy();
  });

  it("renders plant", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.config.light = false;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
    expect(container.querySelector("meshbasicmaterial")).toBeTruthy();
  });

  it("changes cursor on hover when clickable", () => {
    const bed = setupGardenBed();
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.dispatch = mockDispatch(jest.fn());
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0']");
    expect(plant).not.toBeNull();
    fireEvent.pointerEnter(plant as Element);
    expect(bed.style.cursor).toEqual("pointer");
    fireEvent.pointerLeave(plant as Element);
    expect(bed.style.cursor).toEqual("move");
  });

  it("renders spread without image", () => {
    const p = fakeProps();
    p.renderImage = false;
    p.spreadVisible = true;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("sphere");
    expect(container).not.toContainHTML("avif");
  });

  it("renders spread", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.spreadVisible = true;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("skips overlap work when not in click-to-add or edit mode", () => {
    location.pathname = Path.mock(Path.designer());
    const overlapSpy = jest.spyOn(spreadHelper, "getSpreadOverlap");
    const p = fakeProps();
    p.spreadVisible = true;
    render(<ThreeDPlant {...p} />);
    expect(overlapSpy).not.toHaveBeenCalled();
    overlapSpy.mockRestore();
  });

  it("computes overlap when in click-to-add mode", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const overlapSpy = jest.spyOn(spreadHelper, "getSpreadOverlap");
    const p = fakeProps();
    p.spreadVisible = true;
    render(<ThreeDPlant {...p} />);
    expect(overlapSpy).toHaveBeenCalled();
    overlapSpy.mockRestore();
  });

  it("skips overlap when selected", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const overlapSpy = jest.spyOn(spreadHelper, "getSpreadOverlap");
    const p = fakeProps();
    p.spreadVisible = true;
    p.selectedPlantUuid = p.plant.uuid;
    render(<ThreeDPlant {...p} />);
    expect(overlapSpy).not.toHaveBeenCalled();
    overlapSpy.mockRestore();
  });

  it("skips overlap when spread is hidden", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const overlapSpy = jest.spyOn(spreadHelper, "getSpreadOverlap");
    const p = fakeProps();
    p.spreadVisible = false;
    render(<ThreeDPlant {...p} />);
    expect(overlapSpy).not.toHaveBeenCalled();
    overlapSpy.mockRestore();
  });

  it("renders spread: edit plant mode", () => {
    location.pathname = Path.mock(Path.plants("1"));
    const p = fakeProps();
    p.spreadVisible = true;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("uses current plant spread in edit mode", () => {
    location.pathname = Path.mock(Path.plants("1"));
    const radiiSpy = jest.spyOn(spreadHelper, "getSpreadRadii");
    const p = fakeProps();
    render(<ThreeDPlant {...p} />);
    expect(radiiSpy.mock.calls[0][0].activeDragSpread)
      .toEqual(p.plants[0].spread);
    radiiSpy.mockRestore();
  });

  it("renders spread: edit plant mode without plant", () => {
    location.pathname = Path.mock(Path.plants("999999"));
    const p = fakeProps();
    p.spreadVisible = true;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("sphere");
  });

  it("hides spread in edit mode when layer is off", () => {
    location.pathname = Path.mock(Path.plants("1"));
    const p = fakeProps();
    p.spreadVisible = false;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).not.toContainHTML("sphere");
  });

  it("renders plant: not size animated", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.config.light = false;
    p.config.animateSeasons = true;
    p.startTimeRef = undefined;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
  });

  it("renders plant: size animated", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.config.light = false;
    p.config.animateSeasons = true;
    p.startTimeRef = { current: 0 };
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
  });

  it("renders plant under light", () => {
    const p = fakeProps();
    p.config.labels = false;
    p.config.labelsOnHover = false;
    p.config.light = true;
    const { container } = render(<ThreeDPlant {...p} />);
    expect(container).toContainHTML("avif");
  });

  it("navigates to plant info", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN, payload: true,
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.plants("1"));
  });

  it("doesn't navigate to plant info", () => {
    const p = fakeProps();
    p.dispatch = undefined;
    p.plant.id = 1;
    const { container } = render(<ThreeDPlant {...p} />);
    const plant = container.querySelector("[name='0'");
    plant && fireEvent.click(plant);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
