import React from "react";
import { GardenPoint } from "../garden_point";
import { GardenPointProps } from "../../../interfaces";
import { fakePoint } from "../../../../../__test_support__/fake_state/resources";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { Actions } from "../../../../../constants";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import {
  fakeCameraCalibrationData, fakeCameraCalibrationDataFull,
} from "../../../../../__test_support__/fake_camera_data";
import { shallow } from "enzyme";
import { CameraViewArea } from "../../farmbot/bot_figure";
import { Color } from "../../../../../ui";
import { tagAsSoilHeight } from "../../../../../points/soil_height";
import { SpecialStatus } from "farmbot";
import { Path } from "../../../../../internal_urls";

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
    getSoilHeightColor: () => "rgb(128, 128, 128)",
    current: false,
    animate: false,
  });

  it("renders point", () => {
    const wrapper = svgMount(<GardenPoint {...fakeProps()} />);
    expect(wrapper.find("#point-radius").props().r).toEqual(100);
    expect(wrapper.find("#point-center").props().r).toEqual(2);
    expect(wrapper.find("#point-radius").props().fill).toEqual("transparent");
    expect(wrapper.find("#point-radius").props().strokeDasharray).toBeFalsy();
    expect(wrapper.find("text").length).toEqual(0);
  });

  it("renders unsaved grid point", () => {
    const p = fakeProps();
    p.point.specialStatus = SpecialStatus.DIRTY;
    p.point.body.meta.gridId = "123";
    const wrapper = svgMount(<GardenPoint {...p} />);
    expect(wrapper.find("#point-radius").props().strokeDasharray).toEqual("4 5");
  });

  it("hovers point: not animated", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.point.uuid
    });
    expect(wrapper.html()).not.toContain("animate");
  });

  it("hovers point: animated", () => {
    const p = fakeProps();
    p.animate = true;
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: p.point.uuid
    });
    expect(wrapper.html()).toContain("animate");
  });

  it("is hovered", () => {
    const p = fakeProps();
    p.hovered = true;
    const wrapper = svgMount(<GardenPoint {...p} />);
    expect(wrapper.find("#point-radius").props().fill).toEqual("green");
  });

  it("un-hovers point", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_HOVERED_POINT,
      payload: undefined
    });
  });

  it("opens point info", () => {
    const p = fakeProps();
    const wrapper = svgMount(<GardenPoint {...p} />);
    wrapper.find("g").simulate("click");
    expect(mockNavigate).toHaveBeenCalledWith(Path.points(p.point.body.id));
  });

  it("shows camera view area", () => {
    const p = fakeProps();
    p.point.body.meta.gridId = "gridId";
    p.cameraViewGridId = "gridId";
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cropPhotos = true;
    const wrapper = shallow(<GardenPoint {...p} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(1);
  });

  it("doesn't show camera view area", () => {
    const p = fakeProps();
    p.point.body.meta.gridId = undefined;
    p.cameraViewGridId = undefined;
    p.cameraCalibrationData = fakeCameraCalibrationDataFull();
    p.cropPhotos = true;
    const wrapper = shallow(<GardenPoint {...p} />);
    expect(wrapper.find(CameraViewArea).length).toEqual(0);
  });

  it("shows z labels", () => {
    const p = fakeProps();
    p.point.body.z = -100;
    tagAsSoilHeight(p.point);
    p.soilHeightLabels = true;
    const wrapper = svgMount(<GardenPoint {...p} />);
    expect(wrapper.text()).toContain("-100");
    expect(wrapper.find("text").first().props().fill)
      .toEqual(p.getSoilHeightColor(-100));
    expect(wrapper.find("text").first().props().stroke).toEqual(Color.black);
  });

  it("shows hovered z label", () => {
    const p = fakeProps();
    p.hovered = true;
    p.point.body.z = -100;
    tagAsSoilHeight(p.point);
    p.soilHeightLabels = true;
    const wrapper = svgMount(<GardenPoint {...p} />);
    expect(wrapper.text()).toContain("-100");
    expect(wrapper.find("text").first().props().stroke).toEqual(Color.orange);
  });
});
