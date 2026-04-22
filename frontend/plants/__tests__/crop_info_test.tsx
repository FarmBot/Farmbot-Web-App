import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import {
  RawCropInfo as CropInfo, mapStateToProps,
} from "../crop_info";
import { CropInfoProps } from "../../farm_designer/interfaces";
import { initSave } from "../../api/crud";
import * as crud from "../../api/crud";
import * as mapActions from "../../farm_designer/map/actions";
import { fakeState } from "../../__test_support__/fake_state";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import {
  fakeCurve, fakePlant, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { fakeDesignerState } from "../../__test_support__/fake_designer_state";
import { CurveType } from "../../curves/templates";
import { changeCurve, findCurve } from "../curve_info";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import * as ui from "../../ui";
import { FBSelectProps } from "../../ui/new_fb_select";
import { BIProps } from "../../ui/blurable_input";

let initSaveSpy: jest.SpyInstance;
let initSpy: jest.SpyInstance;
let unselectPlantSpy: jest.SpyInstance;
let setDragIconSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance;
let blurableInputSpy: jest.SpyInstance;

beforeEach(() => {
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  initSpy = jest.spyOn(crud, "init").mockImplementation(jest.fn());
  unselectPlantSpy = jest.spyOn(mapActions, "unselectPlant")
    .mockImplementation(jest.fn(() => jest.fn()));
  setDragIconSpy = jest.spyOn(mapActions, "setDragIcon")
    .mockImplementation(jest.fn());
  fbSelectSpy = jest.spyOn(ui, "FBSelect")
    .mockImplementation(((props: FBSelectProps) => <select
      value={props.selectedItem?.value || ""}
      onChange={e => {
        const item = props.list.find(
          item => item.value == e.currentTarget.value,
        );
        item && props.onChange(item);
      }}>
      <option value={""} />
      {props.list.map(item =>
        <option key={item.value} value={item.value}>
          {item.label}
        </option>)}
    </select>) as never);
  blurableInputSpy = jest.spyOn(ui, "BlurableInput")
    .mockImplementation(((props: BIProps) => <input
      value={props.value}
      onChange={e =>
        props.onCommit(e)} />) as never);
});

afterEach(() => {
  initSaveSpy.mockRestore();
  initSpy.mockRestore();
  unselectPlantSpy.mockRestore();
  setDragIconSpy.mockRestore();
  fbSelectSpy.mockRestore();
  blurableInputSpy.mockRestore();
});

describe("<CropInfo />", () => {
  const fakeProps = (): CropInfoProps => {
    const designer = fakeDesignerState();
    return {
      dispatch: jest.fn(() => Promise.resolve()),
      designer,
      botPosition: { x: undefined, y: undefined, z: undefined },
      xySwap: false,
      getConfigValue: jest.fn(),
      sourceFbosConfig: () => ({ value: 0, consistent: true }),
      botSize: fakeBotSize(),
      curves: [],
      plants: [],
    };
  };

  const rowInput = (
    container: HTMLElement,
    className: "planted-at" | "radius",
  ) => container
    .querySelector(`label.${className}`)
    ?.closest(".row")
    ?.querySelector("input") as HTMLInputElement;

  const normalizedText = (container: HTMLElement) =>
    (container.textContent || "").toLowerCase().replace(/\s+/g, "");

  it("renders", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    expect(screen.getByText("Mint")).toBeInTheDocument();
    expect(screen.getByText("Row Spacing")).toBeInTheDocument();
    expect(container.querySelector("img.crop-drag-info-image"))
      .toHaveAttribute("src", "/crops/icons/mint.avif");
  });

  it("returns to crop search", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    const backArrow = container.querySelector(".back-arrow");
    expect(backArrow).toBeTruthy();
    fireEvent.click(backArrow as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("renders stage", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropStage = "planted";
    const { container } = render(<CropInfo {...p} />);
    const select = container
      .querySelector("label.stage")
      ?.closest(".row")
      ?.querySelector("select") as HTMLSelectElement;
    expect(select.value).toEqual("planted");
  });

  it("updates stage", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    const select = container
      .querySelector("label.stage")
      ?.closest(".row")
      ?.querySelector("select") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "planned" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_STAGE, payload: "planned",
    });
  });

  it("renders planted at", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropPlantedAt = "2020-01-20T20:00:00.000Z";
    const { container } = render(<CropInfo {...p} />);
    expect(rowInput(container, "planted-at").value).toEqual("2020-01-20");
  });

  it("updates planted at", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    fireEvent.change(rowInput(container, "planted-at"),
      { target: { value: "2020-01-20T20:00:00.000Z" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_PLANTED_AT, payload: "2020-01-20T20:00:00.000Z",
    });
  });

  it("renders radius", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropRadius = 100;
    const { container } = render(<CropInfo {...p} />);
    expect(rowInput(container, "radius").value).toEqual("100");
  });

  it("updates radius", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    fireEvent.change(rowInput(container, "radius"), { target: { value: "100" } });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_RADIUS, payload: 100,
    });
  });

  it("updates curves", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    render(<CropInfo {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_WATER_CURVE_ID, payload: undefined,
    });
  });

  it("doesn't change search query", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.designer.cropSearchQuery = "mint";
    const { container } = render(<CropInfo {...p} />);
    const backArrow = container.querySelector(".back-arrow");
    expect(backArrow).toBeTruthy();
    fireEvent.click(backArrow as Element);
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
    expect(p.dispatch).not.toHaveBeenCalledWith({
      type: Actions.SEARCH_QUERY_CHANGE, payload: "mint",
    });
  });

  it("disables 'add plant @ UTM' button", () => {
    render(<CropInfo {...fakeProps()} />);
    expect(screen.getByRole("button", { name: /location \(unknown\)/i }))
      .toBeDisabled();
  });

  it("adds a plant at the current bot position", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.botPosition = { x: 100, y: 200, z: undefined };
    render(<CropInfo {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /location \(100, 200\)/i }));
    expect(initSave).toHaveBeenCalledWith("Point",
      expect.objectContaining({
        name: "Mint",
        x: 100,
        y: 200,
        z: 0,
      }));
  });

  it("doesn't add a plant at the current bot position", () => {
    const p = fakeProps();
    p.botPosition = { x: 100, y: undefined, z: undefined };
    render(<CropInfo {...p} />);
    fireEvent.click(screen.getByRole("button", { name: /location \(unknown\)/i }));
    expect(initSave).not.toHaveBeenCalled();
  });

  it("renders cm in mm", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    render(<CropInfo {...p} />);
    expect(screen.getByText("750mm")).toBeInTheDocument();
  });

  it("renders missing values", () => {
    location.pathname = Path.mock(Path.cropSearch("x"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    expect(normalizedText(container)).toContain("sowingnotavailable");
    expect(normalizedText(container)).toContain("commonnamesnotavailable");
  });

  it("handles string of names", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const { container } = render(<CropInfo {...p} />);
    expect(normalizedText(container)).toContain("commonnamesmint,spearmint");
  });

  it("navigates to companion plant", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => fakeState());
    render(<CropInfo {...p} />);
    jest.clearAllMocks();
    const companion = screen.getByText("Green Zebra Tomato");
    expect(companion).toBeInTheDocument();
    fireEvent.click(companion);
    expect(mockNavigate).toHaveBeenCalledWith(
      Path.cropSearch("green-zebra-tomato"));
  });

  it("drags companion plant", () => {
    jest.useFakeTimers();
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    render(<CropInfo {...p} />);
    jest.clearAllMocks();
    const companion = screen.getByText("Green Zebra Tomato");
    fireEvent.dragStart(companion);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: 0,
    });
    fireEvent.dragEnd(companion);
    jest.runAllTimers();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_COMPANION_INDEX,
      payload: undefined,
    });
    jest.useRealTimers();
  });

  it("renders curves", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    p.plants = [plant];
    render(<CropInfo {...p} />);
    expect(screen.getByText("Mint")).toBeInTheDocument();
    expect(screen.getByText("Water")).toBeInTheDocument();
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.show_plants = false;
    state.resources = buildResourceIndex([webAppConfig]);
    state.bot.hardware.location_data.position = { x: 1, y: 2, z: 3 };
    const props = mapStateToProps(state);
    expect(props.botPosition).toEqual({ x: 1, y: 2, z: 3 });
    expect(props.getConfigValue("show_plants")).toEqual(false);
  });
});

describe("findCurve()", () => {
  it("finds curve", () => {
    const curve = fakeCurve();
    curve.body.id = 1;
    const designer = fakeDesignerState();
    designer.cropWaterCurveId = curve.body.id;
    const result = findCurve([curve], designer)(CurveType.water);
    expect(result).toEqual(curve);
  });
});

describe("changeCurve()", () => {
  it("changes curve", () => {
    const dispatch = jest.fn();
    changeCurve(dispatch)(1, CurveType.water);
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CROP_WATER_CURVE_ID, payload: 1,
    });
  });
});
