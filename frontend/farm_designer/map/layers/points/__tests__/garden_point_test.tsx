import React from "react";
import { GardenPoint } from "../garden_point";
import { GardenPointProps } from "../../../interfaces";
import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { render, fireEvent } from "@testing-library/react";
import {
  fakeCameraCalibrationData, fakeCameraCalibrationDataFull,
} from "../../../../../__test_support__/fake_camera_data";
import { Color } from "../../../../../ui";
import { tagAsSoilHeight } from "../../../../../points/soil_height";
import { SpecialStatus } from "farmbot";

describe("<GardenPoint/>", () => {
  const fakeProps = (): GardenPointProps => ({
    mapTransformProps: fakeMapTransformProps(),
    point: fakePoint(),
    hovered: false,
    dispatch: jest.fn(),
    cameraViewGridId: undefined,
    cameraCalibrationData: fakeCameraCalibrationData(),
    cropPhotos: false,
    showUncroppedArea: false,
    soilHeightLabels: false,
    getSoilHeightColor: () => ({ rgb: "rgb(128, 128, 128)", a: 1 }),
    current: false,
    animate: false,
  });

  const renderPoint = (props: GardenPointProps) =>
    render(<svg><GardenPoint {...props} /></svg>);

  const getRadius = (container: HTMLElement) => {
    const radius = container.querySelector("#point-radius");
    if (!radius) { throw new Error("Missing point radius"); }
    return radius;
  };

  const getCenter = (container: HTMLElement) => {
    const center = container.querySelector("#point-center");
    if (!center) { throw new Error("Missing point center"); }
    return center;
  };

  const getPointGroup = (container: HTMLElement) => {
    const pointGroup = container.querySelector(".map-point");
    if (!pointGroup) { throw new Error("Missing map point"); }
    return pointGroup;
  };

  it("renders point", () => {
    const { container } = renderPoint(fakeProps());
    expect(getRadius(container).getAttribute("r")).toEqual("100");
    expect(getCenter(container).getAttribute("r")).toEqual("2");
    expect(getRadius(container).getAttribute("fill")).toEqual("transparent");
    expect(getRadius(container).getAttribute("stroke-dasharray")).toBeNull();
    expect(container.querySelectorAll("text").length).toEqual(0);
  });

  it("renders unsaved grid point", () => {
    const p = fakeProps();
    p.point.specialStatus = SpecialStatus.DIRTY;
    p.point.body.meta.gridId = "123";
    const { container } = renderPoint(p);
    expect(getRadius(container).getAttribute("stroke-dasharray")).toEqual("4 5");
  });

  it("hovers point: not animated", () => {
    const p = fakeProps();
    const { container } = renderPoint(p);
    fireEvent.mouseEnter(getPointGroup(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.point.uuid
    });
    expect(getRadius(container).getAttribute("class") || "")
      .not.toContain("animate");
  });

  it("hovers point: animated", () => {
    const p = fakeProps();
    p.animate = true;
    const { container } = renderPoint(p);
    fireEvent.mouseEnter(getPointGroup(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.point.uuid
    });
    expect(getRadius(container).getAttribute("class") || "")
      .toContain("animate");
  });

  it("is hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const { container } = renderPoint(p);
    expect(getRadius(container).getAttribute("fill")).toEqual("green");
  });

  it("un-hovers point", () => {
    const p = fakeProps();
    const { container } = renderPoint(p);
    fireEvent.mouseLeave(getPointGroup(container));
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });

  it("opens point info", () => {
    const p = fakeProps();
    const { container } = renderPoint(p);
    fireEvent.click(getPointGroup(container));
    expect(p.dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.SELECT_POINT,
    }));
  });

  it("shows camera view area", () => {
    const p = fakeProps();
    p.point.body.meta.gridId = "gridId";
    p.cameraViewGridId = "gridId";
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cropPhotos = true;
    const { container } = renderPoint(p);
    expect(container.querySelector("#camera-view-area-wrapper"))
      .toBeInTheDocument();
  });

  it("doesn't show camera view area", () => {
    const p = fakeProps();
    p.point.body.meta.gridId = undefined;
    p.cameraViewGridId = undefined;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cropPhotos = true;
    const { container } = renderPoint(p);
    expect(container.querySelector("#camera-view-area-wrapper")).toBeNull();
  });

  it("shows z labels", () => {
    const p = fakeProps();
    p.point.body.z = -100;
    tagAsSoilHeight(p.point);
    p.soilHeightLabels = true;
    const { container } = renderPoint(p);
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing soil height label"); }
    expect(text.textContent).toContain("-100");
    expect(text.getAttribute("fill")).toEqual(p.getSoilHeightColor(-100).rgb);
    expect(text.getAttribute("stroke")).toEqual(Color.black);
  });

  it("shows hovered z label", () => {
    const p = fakeProps();
    p.hovered = true;
    p.point.body.z = -100;
    tagAsSoilHeight(p.point);
    p.soilHeightLabels = true;
    const { container } = renderPoint(p);
    const text = container.querySelector("text");
    if (!text) { throw new Error("Missing soil height label"); }
    expect(text.textContent).toContain("-100");
    expect(text.getAttribute("stroke")).toEqual(Color.orange);
  });
});
