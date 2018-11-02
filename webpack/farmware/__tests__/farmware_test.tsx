jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../history", () => ({
  history: {
    push: jest.fn(),
    getCurrentLocation: () => ({ pathname: "" })
  },
}));

const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
};

jest.mock("../../device", () => ({
  getDevice: () => (mockDevice)
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwarePage } from "../index";
import { FarmwareProps } from "../../devices/interfaces";
import { fakeFarmware, fakeFarmwares } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";

describe("<FarmwarePage />", () => {
  const fakeProps = (): FarmwareProps => {
    return {
      farmwares: fakeFarmwares(),
      botToMqttStatus: "up",
      env: {},
      user_env: {},
      dispatch: jest.fn(),
      currentImage: undefined,
      images: [],
      timeOffset: 0,
      syncStatus: "synced",
      webAppConfig: {},
      firstPartyFarmwareNames: [],
      currentFarmware: undefined,
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
    };
  };

  it("renders panels", () => {
    const wrapper = mount(<FarmwarePage {...fakeProps()} />);
    ["Farmware", "My Farmware"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("renders photos page by default", () => {
    const wrapper = mount(<FarmwarePage {...fakeProps()} />);
    expect(wrapper.text()).toContain("Take Photo");
  });

  const TEST_DATA = {
    "Photos": ["Take Photo"],
    "take-photo": ["Take Photo"],
    "Weed Detector": ["detect weeds", "CLEAR WEEDS", "Color Range"],
    "plant-detection": ["detect weeds", "CLEAR WEEDS", "Color Range"],
    "Camera Calibration": ["Calibrate", "Color Range", "Invert Hue Range Selection"],
    "camera-calibration": ["Calibrate", "Color Range", "Invert Hue Range Selection"],
  };

  Object.entries(TEST_DATA).map(([farmware, expectedText]) =>
    it(`renders ${farmware} Farmware page`, () => {
      const p = fakeProps();
      p.currentFarmware = farmware;
      const wrapper = mount(<FarmwarePage {...p} />);
      expectedText.map(string =>
        expect(wrapper.text()).toContain(string));
    })
  );
  it("renders installed Farmware page", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.name = "My Fake Test Farmware";
    p.farmwares["My Fake Test Farmware"] = farmware;
    p.currentFarmware = "My Fake Test Farmware";
    const wrapper = mount(<FarmwarePage {...p} />);
    ["My Fake Test Farmware", "Does things", "Run", "Config 1",
      "Information", "Description", "Version", "Update", "Remove"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("renders installed Farmware page with no inputs", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.config = [];
    farmware.name = "My Fake Test Farmware";
    p.farmwares["My Fake Test Farmware"] = farmware;
    p.currentFarmware = "My Fake Test Farmware";
    const wrapper = mount(<FarmwarePage {...p} />);
    ["My Fake Farmware", "Does things", "Run", "No inputs provided."
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("runs Farmware", () => {
    const p = fakeProps();
    const farmware = fakeFarmware();
    farmware.config = [];
    farmware.name = "My Fake Test Farmware";
    p.farmwares["My Fake Test Farmware"] = farmware;
    p.currentFarmware = "My Fake Test Farmware";
    const wrapper = mount(<FarmwarePage {...p} />);
    clickButton(wrapper, 1, "Run");
    expect(mockDevice.execScript).toHaveBeenCalledWith("My Fake Test Farmware");
  });
});
