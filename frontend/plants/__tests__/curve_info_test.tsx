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

describe("<CurveInfo />", () => {
  const fakeProps = (): CurveInfoProps => ({
    curveType: CurveType.water,
    dispatch: jest.fn(),
    curve: fakeCurve(),
    sourceFbosConfig: () => ({ value: 0, consistent: true }),
    botSize: fakeBotSize(),
    updatePlant: jest.fn(),
    plant: formatPlantInfo(fakePlant()),
    curves: [],
  });

  it("displays curve", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).not.toContain("none");
  });

  it("doesn't display curve", () => {
    const p = fakeProps();
    p.curve = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("none");
  });

  it("displays curve name", () => {
    const p = fakeProps();
    const curve = fakeCurve();
    curve.body.type = "water";
    curve.body.id = 1;
    p.curve = curve;
    p.updatePlant = undefined;
    p.plant = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase())
      .toEqual("waterfake - 0l over 2 days1dayml");
  });

  it("doesn't display curve name", () => {
    const p = fakeProps();
    p.curve = undefined;
    p.updatePlant = undefined;
    p.plant = undefined;
    const wrapper = mount(<CurveInfo {...p} />);
    expect(wrapper.text().toLowerCase()).toEqual("waternone");
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
    p.plant &&
      expect(p.updatePlant).toHaveBeenCalledWith(p.plant.uuid,
        { water_curve_id: 1 }, true);
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
    p.plant &&
      expect(p.updatePlant).toHaveBeenCalledWith(p.plant.uuid,
        { water_curve_id: undefined }, true);
  });
});
