import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  RawLocationInfo as LocationInfo, LocationInfoProps, mapStateToProps,
  ImageListItem, ImageListItemProps,
} from "../location_info";
import { fakeState } from "../../__test_support__/fake_state";
import { BooleanSetting } from "../../session_keys";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import {
  fakeFbosConfig,
  fakeImage, fakePlant, fakePoint, fakeSensor, fakeSensorReading, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../points/soil_height";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";

let lastImageFlipperProps: Record<string, unknown> | undefined;

jest.mock("../../photos/images/image_flipper", () => ({
  ImageFlipper: (props: Record<string, unknown>) => {
    lastImageFlipperProps = props;
    return <div>
      <button className={"mock-image-flipper"}
        onClick={() =>
          (props.flipActionOverride as ((index: number) => void) | undefined)
            ?.call(undefined, 1)}>
        flip image
      </button>
      <div className={"image-jsx"}
        onMouseEnter={() =>
          (props.hover as ((uuid: string) => void) | undefined)
            ?.call(undefined, (props.currentImage as { uuid: string }).uuid)} />
    </div>;
  },
}));

describe("<LocationInfo />", () => {
  const originalSearch = location.search;

  beforeEach(() => {
    jest.useRealTimers();
    lastImageFlipperProps = undefined;
  });

  afterEach(() => {
    cleanup();
    location.search = originalSearch;
  });

  afterAll(() => {
    jest.unmock("../../photos/images/image_flipper");
  });

  const fakeProps = (): LocationInfoProps => ({
    chosenLocation: { x: undefined, y: undefined, z: undefined },
    currentBotLocation: { x: undefined, y: undefined, z: undefined },
    botOnline: true,
    dispatch: jest.fn(),
    plants: [fakePlant()],
    genericPoints: [tagAsSoilHeight(fakePoint())],
    sensorReadings: [fakeSensorReading()],
    images: [fakeImage()],
    getConfigValue: jest.fn(),
    env: {},
    sensors: [fakeSensor()],
    timeSettings: fakeTimeSettings(),
    hoveredSensorReading: undefined,
    locked: false,
    farmwareEnvs: [],
    arduinoBusy: false,
    movementState: fakeMovementState(),
    defaultAxisOrder: "safe_z",
  });

  it("renders empty panel", () => {
    const { container } = render(<LocationInfo {...fakeProps()} />);
    expect(container.textContent?.toLowerCase())
      .toContain("select a location in the map");
  });

  it("handles missing sensor pin", () => {
    const p = fakeProps();
    p.sensors[0].body.pin = undefined;
    const { container } = render(<LocationInfo {...p} />);
    expect(container.textContent?.toLowerCase())
      .toContain("select a location in the map");
  });

  it("updates query", () => {
    location.search = "?x=123&y=456";
    const p = fakeProps();
    render(<LocationInfo {...p} />);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 123, y: 456, z: 0 },
    });
  });

  it("renders items", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 0, y: 0, z: 0 };
    const { container } = render(<LocationInfo {...p} />);
    ["plant", "sensor", "height", "image"].map(string =>
      expect(container.textContent?.toLowerCase()).toContain(string));
  });

  it("handles missing locations", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 0, y: 0, z: 0 };
    const image = fakeImage();
    image.body.meta.x = undefined;
    p.images = [image];
    p.plants = [];
    const point0 = fakePoint();
    tagAsSoilHeight(point0);
    const point1 = fakePoint();
    tagAsSoilHeight(point1);
    p.genericPoints = [point0, point1];
    const { container } = render(<LocationInfo {...p} />);
    ["readings (1)", "measurements (2)", "plants (0)", "images (0)"]
      .map(string => expect(container.textContent?.toLowerCase())
        .toContain(string));
  });

  it("unmounts", () => {
    const p = fakeProps();
    const { unmount } = render(<LocationInfo {...p} />);
    jest.clearAllMocks();
    unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  });

  it("hovers items", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 0, y: 0, z: 0 };
    const plant0 = fakePlant();
    plant0.uuid = "plantUuid";
    const plant1 = fakePlant();
    plant1.uuid = "plantUuid";
    plant1.body.x = 1000;
    plant1.body.y = 1000;
    p.plants = [plant0, plant1];
    const point = tagAsSoilHeight(fakePoint());
    point.uuid = "pointUuid";
    p.genericPoints = [point];
    const reading = fakeSensorReading();
    reading.uuid = "sensorReadingUuid";
    p.sensorReadings = [reading];
    const image = fakeImage();
    image.uuid = "imageUuid";
    p.images = [image];
    const { container } = render(<LocationInfo {...p} />);
    container.querySelectorAll(".expandable-header")
      .forEach(header => fireEvent.click(header));
    jest.clearAllMocks();
    const plantItem = container.querySelector(".plant-search-item");
    if (!plantItem) { throw new Error("Expected plant item"); }
    fireEvent.mouseEnter(plantItem);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_PLANT,
      payload: { plantUUID: "plantUuid" },
    });
    jest.clearAllMocks();
    const pointItem = container.querySelector(".point-search-item");
    if (!pointItem) { throw new Error("Expected point item"); }
    fireEvent.mouseEnter(pointItem);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT, payload: "pointUuid",
    });
    jest.clearAllMocks();
    const row = container.querySelector(".table-row");
    if (!row) { throw new Error("Expected table row"); }
    fireEvent.mouseEnter(row);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_SENSOR_READING, payload: "sensorReadingUuid",
    });
    jest.clearAllMocks();
    const imageJsx = container.querySelector(".image-jsx");
    if (!imageJsx) { throw new Error("Expected image jsx"); }
    fireEvent.mouseEnter(imageJsx);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.HOVER_IMAGE, payload: "imageUuid",
    });
  });

  it("sets point data", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 1, y: 1, z: 0 };
    p.currentBotLocation = { x: 10, y: 1, z: 0 };
    const { container } = render(<LocationInfo {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("9mm from farmbot");
    jest.clearAllMocks();
    fireEvent.click(screen.getByText("Add point at this location"));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: "Location Point", cx: 1, cy: 1, color: "gray", r: 0, z: 0,
        at_soil_level: false,
      },
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.points("add"));
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeWebAppConfig(), fakeFbosConfig()]);
    const props = mapStateToProps(state);
    expect(props.getConfigValue(BooleanSetting.xy_swap)).toEqual(false);
  });

  it("handles missing config", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToProps(state);
    expect(props.getConfigValue(BooleanSetting.xy_swap)).toEqual(undefined);
  });
});

describe("<ImageListItem />", () => {
  const fakeProps = (): ImageListItemProps => {
    const image0 = fakeImage();
    image0.uuid = "0";
    const image1 = fakeImage();
    image1.uuid = "1";
    return {
      images: { xy: { x: 0, y: 0 }, distance: 0, items: [image0, image1] },
      dispatch: jest.fn(),
      getConfigValue: jest.fn(),
      env: {},
      chosenXY: undefined,
      timeSettings: fakeTimeSettings(),
      arduinoBusy: false,
      currentBotLocation: { x: 0, y: 0, z: 0 },
      movementState: fakeMovementState(),
    };
  };

  it("flips images", () => {
    const p = fakeProps();
    const { container } = render(<ImageListItem {...p} />);
    expect((lastImageFlipperProps?.currentImage as { uuid: string } | undefined))
      .toEqual(p.images.items[1]);
    fireEvent.click(screen.getByText("flip image"));
    expect((lastImageFlipperProps?.currentImage as { uuid: string } | undefined))
      .toEqual(p.images.items[0]);
    expect(container.querySelector(".image-items")).toBeTruthy();
  });
});
