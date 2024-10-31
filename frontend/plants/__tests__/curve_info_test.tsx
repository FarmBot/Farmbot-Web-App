import React from "react";
import { CurveInfo } from "../curve_info";
import { mount, shallow } from "enzyme";
import {
  fakeCurve, fakePlant,
} from "../../__test_support__/fake_state/resources";
import { fakeBotSize } from "../../__test_support__/fake_bot_data";
import { CurveInfoProps } from "../../curves/interfaces";
import { CurveType } from "../../curves/templates";
import { formatPlantInfo } from "../map_state_to_props";
import { FBSelect } from "../../ui";
import { Path } from "../../internal_urls";

describe("<CurveInfo />", () => {
  const fakeProps = (): CurveInfoProps => ({
    curveType: CurveType.water,
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    onChange: jest.fn(),
    plants: [],
    plant: formatPlantInfo(fakePlant()),
    curves: [],
  });

  it("displays curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    p.plant = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("none");
  });

  it("displays curve with x, y", () => {
    location.pathname = Path.mock(Path.cropSearch("mint"));
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    const plant = fakePlant();
    plant.body.openfarm_slug = "mint";
    plant.body.water_curve_id = 1;
    plant.body.x = 100;
    plant.body.y = 200;
    p.plant = formatPlantInfo(plant);
    p.plants = [plant];
    p.curves = [curve];
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("none");
  });

  it("doesn't display curve", () => {
    const p = fakeProps();
    p.curve = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("none");
  });

  it("changes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const wrapper = shallow(<CurveInfo {...p} />);
    wrapper.find(FBSelect).simulate("change",
      { label: "", value: 1, headingId: "water" });
    expect(p.onChange).toHaveBeenCalledWith(1, CurveType.water);
  });

  it("removes curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curves = [curve];
    const wrapper = shallow(<CurveInfo {...p} />);
    wrapper.find(FBSelect).simulate("change",
      { label: "", value: "", isNull: true });
    expect(p.onChange).toHaveBeenCalledWith(undefined, CurveType.water);
  });
});
