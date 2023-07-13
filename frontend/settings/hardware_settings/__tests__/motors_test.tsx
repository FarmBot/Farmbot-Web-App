jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
}));

let mockDefaultValue = 1;
jest.mock("../default_values", () => ({
  getDefaultFwConfigValue: jest.fn(() => () => mockDefaultValue),
  getModifiedClassName: jest.fn(),
}));

import React from "react";
import { MotorsProps } from "../interfaces";
import {
  Motors, motorCurrentMaToPercent, motorCurrentPercentToMa,
} from "../motors";
import { render, mount, shallow } from "enzyme";
import { McuParamName } from "farmbot";
import {
  settingsPanelState as fakeSettingsPanelState,
} from "../../../__test_support__/panel_state";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  fakeFirmwareConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { edit, save } from "../../../api/crud";
import { SingleSettingRow } from "../single_setting_row";
import { range } from "lodash";

describe("<Motors />", () => {
  const fakeConfig = fakeFirmwareConfig();
  const state = fakeState();
  state.resources = buildResourceIndex([fakeConfig]);

  const fakeProps = (): MotorsProps => {
    const settingsPanelState = fakeSettingsPanelState();
    settingsPanelState.motors = true;
    return {
      dispatch: jest.fn(x => x(jest.fn(), () => state)),
      settingsPanelState,
      sourceFwConfig: () => ({ value: 0, consistent: true }),
      firmwareHardware: undefined,
      arduinoBusy: false,
      showAdvanced: true,
    };
  };

  it("renders the base case", () => {
    const wrapper = render(<Motors {...fakeProps()} />);
    ["Enable 2nd X Motor",
      "Max Speed (mm/s)",
    ].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string.toLowerCase()));
  });

  it("shows TMC parameters", () => {
    const p = fakeProps();
    p.firmwareHardware = "express_k10";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).toContain("Motor Current");
  });

  it("doesn't show TMC parameters", () => {
    const p = fakeProps();
    p.firmwareHardware = "farmduino";
    const wrapper = render(<Motors {...p} />);
    expect(wrapper.text()).not.toContain("Motor Current");
  });

  it("shows default value", () => {
    mockDefaultValue = 1;
    const wrapper = shallow(<Motors {...fakeProps()} />);
    expect(wrapper.find(SingleSettingRow).first().props().tooltip)
      .toContain("enabled");
  });

  it("shows different default value", () => {
    mockDefaultValue = 0;
    const wrapper = shallow(<Motors {...fakeProps()} />);
    expect(wrapper.find(SingleSettingRow).first().props().tooltip)
      .toContain("disabled");
  });

  it("shows microstep warning", () => {
    const p = fakeProps();
    p.sourceFwConfig = () => ({ value: 2, consistent: true });
    const wrapper = shallow(<Motors {...p} />);
    expect(wrapper.html()).toContain("input-error");
  });

  const testParamToggle = (
    description: string, parameter: McuParamName, position: number) => {
    it(`${description}`, () => {
      const p = fakeProps();
      p.settingsPanelState.motors = true;
      p.sourceFwConfig = () => ({ value: 1, consistent: true });
      const wrapper = mount(<Motors {...p} />);
      wrapper.find("button").at(position).simulate("click");
      expect(edit).toHaveBeenCalledWith(fakeConfig, { [parameter]: 0 });
      expect(save).toHaveBeenCalledWith(fakeConfig.uuid);
    });
  };
  testParamToggle("toggles enable X2", "movement_secondary_motor_x", 9);
  testParamToggle("toggles invert X2", "movement_secondary_motor_invert_x", 10);
});

describe("motorCurrentMaToPercent()", () => {
  it("returns correct value", () => {
    const CASES = [
      [0, 0],
      [10, 0],
      [30, 0],
      [40, 1],
      [50, 2],
      [59, 3],
      [69, 4],
      [79, 5],
      [89, 6],
      [99, 7],
      [108, 8],
      [118, 9],
      [128, 10],
      [138, 11],
      [148, 12],
      [157, 13],
      [167, 14],
      [177, 15],
      [187, 16],
      [197, 17],
      [206, 18],
      [216, 19],
      [226, 20],
      [236, 21],
      [245, 22],
      [255, 23],
      [265, 24],
      [275, 25],
      [285, 26],
      [294, 27],
      [304, 28],
      [314, 29],
      [324, 30],
      [334, 31],
      [343, 32],
      [353, 33],
      [363, 34],
      [373, 35],
      [383, 36],
      [392, 37],
      [402, 38],
      [412, 39],
      [422, 40],
      [432, 41],
      [441, 42],
      [451, 43],
      [461, 44],
      [471, 45],
      [480, 46],
      [490, 47],
      [500, 48],
      [510, 49],
      [520, 50],
      [956, 51],
      [974, 52],
      [992, 53],
      [1009, 54],
      [1027, 55],
      [1045, 56],
      [1062, 57],
      [1080, 58],
      [1098, 59],
      [1115, 60],
      [1133, 61],
      [1151, 62],
      [1168, 63],
      [1186, 64],
      [1204, 65],
      [1221, 66],
      [1239, 67],
      [1257, 68],
      [1275, 69],
      [1292, 70],
      [1310, 71],
      [1328, 72],
      [1345, 73],
      [1363, 74],
      [1381, 75],
      [1398, 76],
      [1416, 77],
      [1434, 78],
      [1451, 79],
      [1469, 80],
      [1487, 81],
      [1504, 82],
      [1522, 83],
      [1540, 84],
      [1557, 85],
      [1575, 86],
      [1593, 87],
      [1610, 88],
      [1628, 89],
      [1646, 90],
      [1663, 91],
      [1681, 92],
      [1699, 93],
      [1716, 94],
      [1734, 95],
      [1752, 96],
      [1769, 97],
      [1787, 98],
      [1805, 99],
      [1823, 100],
      [2000, 10],
      [2500, 38],
    ];
    CASES.map(([mA, percent]) =>
      expect(motorCurrentMaToPercent(mA)).toEqual(percent));
  });
});

describe("motorCurrentPercentToMa()", () => {
  it("returns correct value", () => {
    const CASES = [
      [0, 30],
      [1, 40],
      [2, 50],
      [3, 59],
      [4, 69],
      [5, 79],
      [6, 89],
      [7, 99],
      [8, 108],
      [9, 118],
      [10, 128],
      [11, 138],
      [12, 148],
      [13, 157],
      [14, 167],
      [15, 177],
      [16, 187],
      [17, 197],
      [18, 206],
      [19, 216],
      [20, 226],
      [21, 236],
      [22, 245],
      [23, 255],
      [24, 265],
      [25, 275],
      [26, 285],
      [27, 294],
      [28, 304],
      [29, 314],
      [30, 324],
      [31, 334],
      [32, 343],
      [33, 353],
      [34, 363],
      [35, 373],
      [36, 383],
      [37, 392],
      [38, 402],
      [39, 412],
      [40, 422],
      [41, 432],
      [42, 441],
      [43, 451],
      [44, 461],
      [45, 471],
      [46, 480],
      [47, 490],
      [48, 500],
      [49, 510],
      [50, 520],
      [51, 956],
      [52, 974],
      [53, 992],
      [54, 1009],
      [55, 1027],
      [56, 1045],
      [57, 1062],
      [58, 1080],
      [59, 1098],
      [60, 1115],
      [61, 1133],
      [62, 1151],
      [63, 1168],
      [64, 1186],
      [65, 1204],
      [66, 1221],
      [67, 1239],
      [68, 1257],
      [69, 1275],
      [70, 1292],
      [71, 1310],
      [72, 1328],
      [73, 1345],
      [74, 1363],
      [75, 1381],
      [76, 1398],
      [77, 1416],
      [78, 1434],
      [79, 1451],
      [80, 1469],
      [81, 1487],
      [82, 1504],
      [83, 1522],
      [84, 1540],
      [85, 1557],
      [86, 1575],
      [87, 1593],
      [88, 1610],
      [89, 1628],
      [90, 1646],
      [91, 1663],
      [92, 1681],
      [93, 1699],
      [94, 1716],
      [95, 1734],
      [96, 1752],
      [97, 1769],
      [98, 1787],
      [99, 1805],
      [100, 1823],
    ];
    CASES.map(([percent, mA]) =>
      expect(motorCurrentPercentToMa(percent)).toEqual(mA));
  });
});

describe("motor current conversion check", () => {
  it("returns the same value", () => {
    range(101).map(percent => {
      const mA = motorCurrentPercentToMa(percent);
      expect(motorCurrentMaToPercent(mA)).toEqual(percent);
    });
  });
});
