jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { GardenLocationRow } from "../garden_location_row";
import { GardenLocationRowProps } from "../interfaces";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";

describe("<GardenLocationRow />", () => {
  const fakeProps = (): GardenLocationRowProps => ({
    device: fakeDevice(),
    dispatch: jest.fn(),
  });

  it("doesn't have use location button", () => {
    const wrapper = mount(<GardenLocationRow {...fakeProps()} />);
    expect(wrapper.html()).not.toContain("fa-crosshairs");
  });

  it("changes location", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: () => ({}), configurable: true
    });
    navigator.geolocation.getCurrentPosition = cb =>
      cb({
        timestamp: 1,
        coords: {
          accuracy: 1, altitude: 1, altitudeAccuracy: 1, heading: 1, speed: 1,
          latitude: 100, longitude: 50
        }
      });
    const p = fakeProps();
    const wrapper = mount(<GardenLocationRow {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(p.device, { lat: 100, lng: 50 });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes latitude", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenLocationRow {...p} />);
    const input = wrapper.find("input").first();
    input.simulate("change", { currentTarget: { value: 100 } });
    input.simulate("blur");
    expect(edit).toHaveBeenCalledWith(p.device, { lat: 100 });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes longitude", () => {
    const p = fakeProps();
    const wrapper = shallow(<GardenLocationRow {...p} />);
    const input = wrapper.find("input").last();
    input.simulate("change", { currentTarget: { value: 100 } });
    input.simulate("blur");
    expect(edit).toHaveBeenCalledWith(p.device, { lng: 100 });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("changes indoor setting", () => {
    const p = fakeProps();
    const wrapper = mount(<GardenLocationRow {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(edit).toHaveBeenCalledWith(p.device, { indoor: true });
    expect(save).toHaveBeenCalledWith(p.device.uuid);
  });

  it("shows map link", () => {
    const p = fakeProps();
    p.device.body.lat = 100;
    p.device.body.lng = 50;
    const wrapper = mount(<GardenLocationRow {...p} />);
    expect(wrapper.html()).toContain("fa-map");
  });
});
