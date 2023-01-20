import React from "react";
import { mount, shallow } from "enzyme";
import {
  fakeFarmwareEnv,
  fakePoint, fakeSensorReading,
} from "../../../../../__test_support__/fake_state/resources";
import {
  InterpolationKey, getInterpolationData, interpolatedZ,
  DEFAULT_INTERPOLATION_OPTIONS,
  fetchInterpolationOptions,
  InterpolationOption,
  InterpolationSetting,
  InterpolationSettingProps,
  getZAtLocation,
} from "../interpolation_map";

describe("getInterpolationData()", () => {
  it("handles missing data", () => {
    localStorage.removeItem(InterpolationKey.data);
    expect(getInterpolationData("Point")).toEqual([]);
  });
});

describe("interpolatedZ()", () => {
  it("returns undefined", () => {
    expect(interpolatedZ({ x: 0, y: 0 }, [], DEFAULT_INTERPOLATION_OPTIONS))
      .toEqual(undefined);
  });

  it("returns interpolated z value", () => {
    const point0 = fakePoint();
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = 0;
    const point1 = fakePoint();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = 100;
    expect(interpolatedZ({ x: 50, y: 50 }, [point0, point1],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(50);
  });

  it("returns interpolated sensor reading value", () => {
    const point0 = fakeSensorReading();
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = -100;
    point0.body.value = 0;
    const point1 = fakeSensorReading();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = -100;
    point1.body.value = 100;
    expect(interpolatedZ({ x: 50, y: 50 }, [point0, point1],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(50);
  });

  it("handles undefined locations", () => {
    const point0 = fakeSensorReading();
    point0.body.x = undefined;
    point0.body.y = undefined;
    point0.body.z = -100;
    point0.body.value = 0;
    const point1 = fakeSensorReading();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = -100;
    point1.body.value = 100;
    expect(interpolatedZ({ x: 50, y: 50 }, [point0, point1],
      DEFAULT_INTERPOLATION_OPTIONS)).toEqual(100);
  });
});

describe("fetchInterpolationOptions()", () => {
  it("fetches options", () => {
    const env1 = fakeFarmwareEnv();
    env1.body.key = InterpolationOption.stepSize;
    env1.body.value = "123";
    const env2 = fakeFarmwareEnv();
    env2.body.key = InterpolationOption.useNearest;
    env2.body.value = "1";
    const env3 = fakeFarmwareEnv();
    env3.body.key = InterpolationOption.power;
    env3.body.value = "16";
    const farmwareEnvs = [env1, env2, env3];
    const options = fetchInterpolationOptions(farmwareEnvs);
    expect(options.stepSize).toEqual(123);
    expect(options.useNearest).toEqual(true);
    expect(options.power).toEqual(16);
  });

  it("fetches default options", () => {
    expect(fetchInterpolationOptions([])).toEqual(DEFAULT_INTERPOLATION_OPTIONS);
  });
});

describe("getZAtLocation()", () => {
  it("returns z", () => {
    const env1 = fakeFarmwareEnv();
    env1.body.key = InterpolationOption.useNearest;
    env1.body.value = "1";
    const farmwareEnvs = [env1];
    const point0 = fakePoint();
    point0.body.x = 0;
    point0.body.y = 0;
    point0.body.z = 0;
    const point1 = fakePoint();
    point1.body.x = 100;
    point1.body.y = 100;
    point1.body.z = 100;
    const points = [point0, point1];
    expect(getZAtLocation({ x: 60, y: 60, points, farmwareEnvs })).toEqual(100);
  });
});

describe("<InterpolationSetting />", () => {
  const fakeProps = (): InterpolationSettingProps => ({
    label: "label",
    optKey: "key",
    defaultValue: 0,
    farmwareEnvs: [],
    saveFarmwareEnv: jest.fn(),
    dispatch: jest.fn(),
  });

  it("saves env: button", () => {
    const p = fakeProps();
    p.boolean = true;
    const wrapper = mount(<InterpolationSetting {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("key", "1");
  });

  it("saves env: button on", () => {
    const p = fakeProps();
    p.boolean = true;
    const env1 = fakeFarmwareEnv();
    env1.body.key = "key";
    env1.body.value = "1";
    p.farmwareEnvs = [env1];
    const wrapper = mount(<InterpolationSetting {...p} />);
    wrapper.find("button").simulate("click");
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("key", "0");
  });

  it("saves env: input", () => {
    const p = fakeProps();
    const wrapper = shallow(<InterpolationSetting {...p} />);
    wrapper.find("BlurableInput").simulate("commit",
      { currentTarget: { value: "123" } });
    expect(p.saveFarmwareEnv).toHaveBeenCalledWith("key", "123");
  });
});
