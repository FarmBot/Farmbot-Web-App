jest.mock("react-redux", () => ({ connect: jest.fn() }));

const mockDevice = { execScript: jest.fn(() => Promise.resolve({})) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwarePage, BasicFarmwarePage } from "../index";
import { FarmwareProps } from "../../devices/interfaces";
import { fakeFarmware, fakeFarmwares } from "../../__test_support__/fake_farmwares";
import { clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

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
      timeSettings: fakeTimeSettings(),
      syncStatus: "synced",
      getConfigValue: jest.fn(),
      firstPartyFarmwareNames: [],
      currentFarmware: undefined,
      shouldDisplay: () => false,
      saveFarmwareEnv: jest.fn(),
      taggedFarmwareInstallations: [],
      imageJobs: [],
      infoOpen: false,
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

  it("renders photos page by default without farmware data", () => {
    const p = fakeProps();
    p.farmwares = {};
    const wrapper = mount(<FarmwarePage {...p} />);
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
    clickButton(wrapper, 3, "Run");
    expect(mockDevice.execScript).toHaveBeenCalledWith("My Fake Test Farmware");
  });

  it("shows Farmware info", () => {
    const p = fakeProps();
    p.botToMqttStatus = "up";
    p.infoOpen = true;
    const wrapper = mount(<FarmwarePage {...p} />);
    expect(wrapper.html()).toContain("farmware-info-open");
  });

  it("opens Farmware list", () => {
    const p = fakeProps();
    p.botToMqttStatus = "up";
    p.infoOpen = false;
    const wrapper = mount(<FarmwarePage {...p} />);
    clickButton(wrapper, 0, "farmware list");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_FARMWARE, payload: undefined
    });
  });

  it("closes Farmware info", () => {
    const p = fakeProps();
    p.botToMqttStatus = "up";
    p.infoOpen = true;
    const wrapper = mount(<FarmwarePage {...p} />);
    clickButton(wrapper, 0, "back");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FARMWARE_INFO_STATE, payload: false
    });
  });

  it("opens Farmware info", () => {
    const p = fakeProps();
    p.botToMqttStatus = "up";
    p.infoOpen = false;
    const wrapper = mount(<FarmwarePage {...p} />);
    clickButton(wrapper, 1, "farmware info");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_FARMWARE_INFO_STATE, payload: true
    });
  });
});

describe("<BasicFarmwarePage />", () => {
  it("renders Farmware pending install", () => {
    const farmware = fakeFarmware();
    farmware.name = "My Farmware 1";
    farmware.installation_pending = true;
    const wrapper = mount(<BasicFarmwarePage
      botOnline={true}
      farmware={farmware}
      farmwareName={farmware.name} />);
    expect(wrapper.text().toLowerCase()).toContain("pending installation");
    expect(wrapper.find("button").first().props().disabled).toEqual(true);
  });
});
