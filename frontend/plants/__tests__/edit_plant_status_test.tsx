jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { EditPlantStatusProps } from "../plant_panel";
import { shallow } from "enzyme";
import {
  fakeCurve,
  fakePlant, fakePoint, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import { edit } from "../../api/crud";
import {
  EditPlantStatus, PlantStatusBulkUpdateProps, PlantStatusBulkUpdate,
  EditWeedStatus, EditWeedStatusProps, PointSizeBulkUpdate,
  BulkUpdateBaseProps,
  PointColorBulkUpdate,
  PlantDateBulkUpdateProps,
  PlantDateBulkUpdate,
  PlantSlugBulkUpdate,
  PlantSlugBulkUpdateProps,
  PlantDepthBulkUpdate,
  PlantCurvesBulkUpdate,
  PlantCurvesBulkUpdateProps,
  PlantCurveBulkUpdate,
  PlantCurveBulkUpdateProps,
} from "../edit_plant_status";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";
import { Actions } from "../../constants";
import { Path } from "../../internal_urls";
import { CurveType } from "../../curves/templates";

describe("<EditPlantStatus />", () => {
  const fakeProps = (): EditPlantStatusProps => ({
    uuid: "Plant.0.0",
    plantStatus: "planned",
    updatePlant: jest.fn(),
  });

  it("changes stage to planted", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planted" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z")
    });
  });

  it("changes stage to planned", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditPlantStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { value: "planned" });
    expect(p.updatePlant).toHaveBeenCalledWith("Plant.0.0", {
      plant_stage: "planned",
      planted_at: undefined
    });
  });
});

describe("<PlantStatusBulkUpdate />", () => {
  const fakeProps = (): PlantStatusBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    pointerType: "Plant",
  });

  it("doesn't update plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "planted" });
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant statuses", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "planted" });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'planted' for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
    expect(edit).toHaveBeenCalledWith(plant2, {
      plant_stage: "planted",
      planted_at: expect.stringContaining("Z"),
    });
  });

  it("updates weed statuses", () => {
    const p = fakeProps();
    p.pointerType = "Weed";
    const weed1 = fakeWeed();
    const weed2 = fakeWeed();
    const weed3 = fakeWeed();
    p.allPoints = [weed1, weed2, weed3];
    p.selected = [weed1.uuid, weed2.uuid];
    const wrapper = shallow(<PlantStatusBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "removed" });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change status to 'removed' for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(weed1, { plant_stage: "removed" });
    expect(edit).toHaveBeenCalledWith(weed2, { plant_stage: "removed" });
  });
});

describe("<PlantDateBulkUpdate />", () => {
  const fakeProps = (): PlantDateBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    timeSettings: fakeTimeSettings(),
  });

  it("doesn't update plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "2017-05-29T05:00:00.000Z" } });
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant dates", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantDateBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "2017-05-29T05:00:00.000Z" } });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change start date to 2017-05-29 for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
    expect(edit).toHaveBeenCalledWith(plant2, {
      planted_at: "2017-05-29T05:00:00.000Z",
    });
  });
});

describe("<PointSizeBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("input").simulate("change", { currentTarget: { value: "1" } });
    wrapper.find("input").simulate("blur");
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates plant sizes", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PointSizeBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("input").simulate("change", { currentTarget: { value: "1" } });
    wrapper.find("input").simulate("blur");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change radius to 1mm for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, { radius: 1 });
    expect(edit).toHaveBeenCalledWith(plant2, { radius: 1 });
  });
});

describe("<PlantDepthBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("updates plant depths", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantDepthBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("input").simulate("change", { currentTarget: { value: "1" } });
    wrapper.find("input").simulate("blur");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change depth to 1mm for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, { depth: 1 });
    expect(edit).toHaveBeenCalledWith(plant2, { depth: 1 });
  });
});

describe("<PlantCurveBulkUpdate />", () => {
  const fakeProps = (): PlantCurveBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    curves: [fakeCurve()],
    curveType: CurveType.water,
  });

  it("updates plant curves", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantCurveBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").first().simulate("change", { label: "", value: "1" });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change Water curve for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, { water_curve_id: 1 });
    expect(edit).toHaveBeenCalledWith(plant2, { water_curve_id: 1 });
  });

  it("updates plant curves to None", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantCurveBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("FBSelect").first().simulate("change",
      { label: "", value: "", isNull: true });
    expect(window.confirm).toHaveBeenCalledWith(
      "Change Water curve for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, { water_curve_id: undefined });
    expect(edit).toHaveBeenCalledWith(plant2, { water_curve_id: undefined });
  });
});

describe("<PlantCurvesBulkUpdate />", () => {
  const fakeProps = (): PlantCurvesBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    curves: [],
  });

  it("updates plant curves", () => {
    const p = fakeProps();
    const wrapper = shallow(<PlantCurvesBulkUpdate {...p} />);
    expect(wrapper.text()).toContain("PlantCurveBulkUpdate");
  });
});

describe("<PointColorBulkUpdate />", () => {
  const fakeProps = (): BulkUpdateBaseProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
  });

  it("doesn't update point colors", () => {
    const p = fakeProps();
    const point1 = fakePlant();
    const point2 = fakePlant();
    p.allPoints = [point1, point2];
    p.selected = [point1.uuid];
    const wrapper = shallow(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("updates point colors", () => {
    const p = fakeProps();
    const point1 = fakePoint();
    const point2 = fakePoint();
    const point3 = fakePoint();
    p.allPoints = [point1, point2, point3];
    p.selected = [point1.uuid, point2.uuid];
    const wrapper = shallow(<PointColorBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("ColorPicker").simulate("change", "green");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change color to green for 2 items?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(point1, { meta: { color: "green" } });
    expect(edit).toHaveBeenCalledWith(point2, { meta: { color: "green" } });
  });
});

describe("<PlantSlugBulkUpdate />", () => {
  const fakeProps = (): PlantSlugBulkUpdateProps => ({
    allPoints: [],
    selected: [],
    dispatch: jest.fn(),
    bulkPlantSlug: undefined,
  });

  it("doesn't update plant slug", () => {
    const p = fakeProps();
    const plant1 = fakePlant();
    plant1.body.openfarm_slug = "slug";
    const plant2 = fakePlant();
    p.allPoints = [plant1, plant2];
    p.selected = [plant1.uuid];
    const wrapper = shallow(<PlantSlugBulkUpdate {...p} />);
    window.confirm = jest.fn(() => false);
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });

  it("sets bulk plant slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    const wrapper = shallow(<PlantSlugBulkUpdate {...p} />);
    wrapper.find(".fa-pencil").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SLUG_BULK, payload: "slug",
    });
    expect(mockNavigate).toHaveBeenCalledWith(Path.cropSearch());
  });

  it("updates plant slug", () => {
    const p = fakeProps();
    p.bulkPlantSlug = "slug";
    const plant1 = fakePlant();
    const plant2 = fakePlant();
    const plant3 = fakePlant();
    p.allPoints = [plant1, plant2, plant3];
    p.selected = [plant1.uuid, plant2.uuid];
    const wrapper = shallow(<PlantSlugBulkUpdate {...p} />);
    window.confirm = jest.fn(() => true);
    wrapper.find("button").simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      "Change crop type to slug for 2 plants?");
    expect(edit).toHaveBeenCalledTimes(2);
    expect(edit).toHaveBeenCalledWith(plant1, {
      openfarm_slug: "slug",
      name: "Slug",
    });
    expect(edit).toHaveBeenCalledWith(plant2, {
      openfarm_slug: "slug",
      name: "Slug",
    });
  });
});

describe("<EditWeedStatus />", () => {
  const fakeProps = (): EditWeedStatusProps => ({
    weed: fakeWeed(),
    updateWeed: jest.fn(),
  });

  it("updates weed status", () => {
    const p = fakeProps();
    const wrapper = shallow(<EditWeedStatus {...p} />);
    wrapper.find("FBSelect").simulate("change", { label: "", value: "removed" });
    expect(p.updateWeed).toHaveBeenCalledWith({ plant_stage: "removed" });
  });
});
