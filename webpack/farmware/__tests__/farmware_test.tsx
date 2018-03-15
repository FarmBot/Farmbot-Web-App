jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../session", () => ({
  Session: {
    deprecatedGetBool: () => true // Simulate opt-in to beta features.
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { FarmwarePage } from "../index";
import { FarmwareProps } from "../../devices/interfaces";

describe("<FarmwarePage />", () => {
  it("renders widgets", () => {
    const props: FarmwareProps = {
      farmwares: {},
      botToMqttStatus: "up",
      env: {},
      user_env: {},
      dispatch: jest.fn(),
      currentImage: undefined,
      images: [],
      timeOffset: 0,
      syncStatus: "synced",
      webAppConfig: {},
      firstPartyFarmwareNames: []
    };
    const wrapper = mount(<FarmwarePage {...props} />);
    ["Take Photo",
      "Farmware",
      "Camera Calibration",
      "Weed Detector"
    ].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
