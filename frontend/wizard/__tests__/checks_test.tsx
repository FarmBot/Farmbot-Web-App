import { fakeState } from "../../__test_support__/fake_state";
const mockState = fakeState();
jest.mock("../../redux/store", () => ({
  store: { getState: () => mockState, dispatch: jest.fn() },
}));

jest.mock("../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  initSave: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock("../../photos/camera_calibration/actions", () => ({
  calibrate: jest.fn(),
}));

const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
  findHome: jest.fn(() => Promise.resolve({})),
  setZero: jest.fn(() => Promise.resolve({})),
};
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => [],
}));

jest.mock("../../messages/actions", () => ({
  seedAccount: jest.fn(x => () => x()),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import {
  AssemblyDocs,
  CameraCalibrationCard,
  CameraCalibrationCheck,
  CameraCheck,
  CameraImageOrigin,
  CameraOffset,
  CameraReplacement,
  ConfiguratorDocs,
  Connectivity,
  ControlsCheck,
  CurrentPosition,
  DisableStallDetection,
  EthernetPortImage,
  FindHome,
  FirmwareHardwareSelection,
  FlashFirmware,
  InvertJogButton,
  InvertMotor,
  lowVoltageProblemStatus,
  MapOrientation,
  MotorAcceleration,
  MotorCurrent,
  MotorMaxSpeed,
  MotorMinSpeed,
  MotorSettings,
  PeripheralsCheck,
  RotateMapToggle,
  SelectMapOrigin,
  SensorsCheck,
  SetHome,
  SoilHeightMeasurementCheck,
  SwapJogButton,
  SwitchCameraCalibrationMethod,
  ToolCheck,
  Tour,
} from "../checks";
import { WizardStepComponentProps } from "../interfaces";
import {
  fakeAlert,
  fakeFarmwareEnv, fakeFarmwareInstallation, fakeFbosConfig,
  fakeFirmwareConfig, fakeImage, fakeLog, fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { destroy, edit, initSave } from "../../api/crud";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { calibrate } from "../../photos/camera_calibration/actions";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { ExternalUrl } from "../../external_urls";
import { push } from "../../history";
import { PLACEHOLDER_FARMBOT } from "../../photos/images/image_flipper";
import { changeBlurableInput, clickButton } from "../../__test_support__/helpers";
import { Actions } from "../../constants";
import { tourPath } from "../../help/tours";

const fakeProps = (): WizardStepComponentProps => ({
  setStepSuccess: jest.fn(() => jest.fn()),
  resources: buildResourceIndex([]).index,
  bot: bot,
  dispatch: mockDispatch(),
  getConfigValue: jest.fn(),
});

describe("<CameraCheck />", () => {
  it("clicks", () => {
    const p = fakeProps();
    const oldImage = fakeImage();
    oldImage.body.id = 1;
    p.resources = buildResourceIndex([oldImage]).index;
    const wrapper = mount(<CameraCheck {...p} />);
    expect(wrapper.find("img").props().src).toEqual(PLACEHOLDER_FARMBOT);
    const newImage = fakeImage();
    newImage.body.attachment_url = "url";
    newImage.body.id = 10;
    p.resources = buildResourceIndex([newImage]).index;
    wrapper.setProps(p);
    expect(wrapper.find("img").props().src).toEqual("url");
    wrapper.find(".camera-check").simulate("click");
    expect(wrapper.find("img").props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("handles empty images", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([]).index;
    const wrapper = mount(<CameraCheck {...p} />);
    expect(wrapper.find("img").props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("handles undefined fields", () => {
    const p = fakeProps();
    const log = fakeLog();
    log.body.created_at = undefined;
    p.resources = buildResourceIndex([fakeImage(), log, fakeLog()]).index;
    const wrapper = mount(<CameraCheck {...p} />);
    const image = fakeImage();
    image.body.id = undefined;
    p.resources = buildResourceIndex([image]).index;
    wrapper.setProps(p);
    expect(wrapper.find("img").props().src).toEqual(PLACEHOLDER_FARMBOT);
  });

  it("searches recent logs", () => {
    const p = fakeProps();
    const log0 = fakeLog();
    log0.body.message = "USB Camera not detected.";
    log0.body.created_at = 1;
    p.resources = buildResourceIndex([log0]).index;
    const wrapper = mount(<CameraCheck {...p} />);
    wrapper.find(".camera-check").simulate("click");
    expect(p.setStepSuccess).not.toHaveBeenCalled();
    const log1 = fakeLog();
    log1.body.message = "USB Camera not detected.";
    log1.body.created_at = 2;
    p.resources = buildResourceIndex([log1]).index;
    wrapper.setProps(p);
    expect(p.setStepSuccess).toHaveBeenCalledWith(false, "cameraError");
  });
});

describe("lowVoltageProblemStatus()", () => {
  it("returns problem", () => {
    mockState.bot.hardware.informational_settings.throttled = "0x500005";
    expect(lowVoltageProblemStatus()).toEqual(false);
  });

  it("returns ok", () => {
    mockState.bot.hardware.informational_settings.throttled = undefined;
    expect(lowVoltageProblemStatus()).toEqual(true);
  });
});

describe("<FlashFirmware />", () => {
  it("renders button", () => {
    const wrapper = mount(<FlashFirmware {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("flash firmware");
  });
});

describe("<ControlsCheck />", () => {
  it("returns controls", () => {
    const Component = ControlsCheck();
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.find("div").first().hasClass("controls-check")).toBeTruthy();
  });

  it("returns highlighted controls", () => {
    const Component = ControlsCheck({ axis: "x" });
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.html()).toContain("solid yellow");
  });

  it("returns both controls directions highlighted", () => {
    const Component = ControlsCheck({ axis: "x", both: true });
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.html()).toContain("solid yellow");
  });

  it("returns controls with home highlighted", () => {
    const Component = ControlsCheck({ home: true });
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.html()).toContain("solid yellow");
  });
});

describe("<CameraCalibrationCard />", () => {
  it("renders grid", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "CAMERA_CALIBRATION_easy_calibration";
    farmwareEnv.body.value = "\"TRUE\"";
    p.resources = buildResourceIndex([farmwareEnv]).index;
    const wrapper = mount(<CameraCalibrationCard {...p} />);
    expect(wrapper.html()).toContain("svg");
    expect(wrapper.html()).toContain("back");
  });

  it("renders red dots", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "CAMERA_CALIBRATION_easy_calibration";
    farmwareEnv.body.value = "\"FALSE\"";
    p.resources = buildResourceIndex([farmwareEnv]).index;
    const wrapper = mount(<CameraCalibrationCard {...p} />);
    expect(wrapper.html()).toContain("svg");
    expect(wrapper.html()).toContain("front");
  });
});

describe("<SwitchCameraCalibrationMethod />", () => {
  it("changes method", () => {
    const p = fakeProps();
    const wrapper = mount(<SwitchCameraCalibrationMethod {...p} />);
    wrapper.find("input").simulate("change", {
      currentTarget: { checked: true },
    });
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "CAMERA_CALIBRATION_easy_calibration", value: "\"TRUE\""
    });
  });
});

describe("<CameraCalibrationCheck />", () => {
  it("calibrates", () => {
    const wrapper = mount(<CameraCalibrationCheck {...fakeProps()} />);
    wrapper.find(".camera-check").simulate("click");
    expect(calibrate).toHaveBeenCalledWith(true);
  });
});

describe("<SoilHeightMeasurementCheck />", () => {
  it("shows message", () => {
    const wrapper = mount(<SoilHeightMeasurementCheck {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("missing");
  });

  it("runs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const farmware = fakeFarmwareInstallation();
    farmware.body.id = 1;
    farmware.body.package = FarmwareName.MeasureSoilHeight;
    p.resources = buildResourceIndex([farmware]).index;
    const wrapper = mount(<SoilHeightMeasurementCheck {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(mockDevice.execScript).toHaveBeenCalledWith(
      FarmwareName.MeasureSoilHeight, []);
  });
});

describe("<AssemblyDocs />", () => {
  it("renders genesis link", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<AssemblyDocs {...p} />);
    expect(wrapper.find("a").props().href).toEqual(ExternalUrl.genesisAssembly);
  });

  it("renders express link", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "express_k10";
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<AssemblyDocs {...p} />);
    expect(wrapper.find("a").props().href).toEqual(ExternalUrl.expressAssembly);
  });

  it("handles missing config", () => {
    const wrapper = mount(<AssemblyDocs {...fakeProps()} />);
    expect(wrapper.find("a").props().href).toEqual(ExternalUrl.genesisAssembly);
  });
});

describe("<FirmwareHardwareSelection />", () => {
  const state = fakeState();
  const config = fakeFbosConfig();
  state.resources = buildResourceIndex([config]);

  it("selects model", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([fakeFbosConfig()]).index;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = shallow(<FirmwareHardwareSelection {...p} />);
    wrapper.find("FBSelect").simulate("change", {
      label: "", value: "genesis_1.2"
    });
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      firmware_hardware: "arduino"
    });
  });

  it("seeds account", () => {
    const p = fakeProps();
    const alert = fakeAlert();
    alert.body.id = 1;
    alert.body.problem_tag = "api.seed_data.missing";
    p.resources = buildResourceIndex([alert]).index;
    mockState.resources = buildResourceIndex([alert]);
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount<FirmwareHardwareSelection>(
      <FirmwareHardwareSelection {...p} />);
    wrapper.instance().onChange({ label: "", value: "genesis_1.2" });
    expect(destroy).toHaveBeenCalled();
  });

  it("doesn't seed account", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([]).index;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount<FirmwareHardwareSelection>(
      <FirmwareHardwareSelection {...p} />);
    wrapper.instance().onChange({ label: "", value: "genesis_1.2" });
    expect(destroy).not.toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).not.toContain("resources");
  });

  it("renders after account seeding", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([]).index;
    const wrapper = mount<FirmwareHardwareSelection>(
      <FirmwareHardwareSelection {...p} />);
    wrapper.setState({ autoSeed: true });
    expect(wrapper.text().toLowerCase()).toContain("resources added");
  });

  it("toggles auto-seed", () => {
    const p = fakeProps();
    const alert = fakeAlert();
    alert.body.id = 1;
    alert.body.problem_tag = "api.seed_data.missing";
    p.resources = buildResourceIndex([alert]).index;
    const wrapper = shallow<FirmwareHardwareSelection>(
      <FirmwareHardwareSelection {...p} />);
    expect(wrapper.state().autoSeed).toEqual(true);
    wrapper.instance().toggleAutoSeed();
    expect(wrapper.state().autoSeed).toEqual(false);
  });
});

describe("<ConfiguratorDocs />", () => {
  it("follows link", () => {
    const wrapper = mount(<ConfiguratorDocs />);
    wrapper.find("a").simulate("click");
    expect(push).toHaveBeenCalledWith("/app/designer/help?page=farmbot-os");
  });
});

describe("<EthernetPortImage />", () => {
  it("shows image", () => {
    const wrapper = mount(<EthernetPortImage />);
    expect(wrapper.find("img").length).toEqual(1);
  });
});

describe("<Connectivity />", () => {
  it("renders diagram", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([fakeDevice(), config]).index;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("web app");
  });

  it("handles missing config", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([fakeDevice()]).index;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("web app");
  });
});

describe("<InvertMotor />", () => {
  const state = fakeState();
  const config = fakeFirmwareConfig();
  state.resources = buildResourceIndex([config]);

  it("inverts motor", () => {
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    config.body.movement_invert_motor_x = 0;
    p.resources = buildResourceIndex([config]).index;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(InvertMotor("x")(p));
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      movement_invert_motor_x: 1
    });
  });
});

describe("<DisableStallDetection />", () => {
  const state = fakeState();
  const config = fakeFirmwareConfig();
  state.resources = buildResourceIndex([config]);

  it("disables stall detection", () => {
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    config.body.encoder_enabled_x = 0;
    p.resources = buildResourceIndex([config]).index;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(DisableStallDetection("x")(p));
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      encoder_enabled_x: 1
    });
  });
});

describe("<InvertJogButton />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.x_axis_inverted = false;
  state.resources = buildResourceIndex([config]);

  it("inverts button", () => {
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(InvertJogButton("x")(p));
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      x_axis_inverted: true
    });
  });
});

describe("<SwapJogButton />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.xy_swap = false;
  state.resources = buildResourceIndex([config]);

  it("swaps buttons", () => {
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(<SwapJogButton {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { xy_swap: true });
  });
});

describe("<RotateMapToggle />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.xy_swap = false;
  state.resources = buildResourceIndex([config]);

  it("rotates map", () => {
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(<RotateMapToggle {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { xy_swap: true });
  });
});

describe("<SelectMapOrigin />", () => {
  it("renders origin selector", () => {
    const wrapper = mount(<SelectMapOrigin {...fakeProps()} />);
    expect(wrapper.html()).toContain("farmbot-origin");
  });
});

describe("<MapOrientation />", () => {
  it("renders map settings", () => {
    const wrapper = mount(<MapOrientation {...fakeProps()} />);
    expect(wrapper.html()).toContain("map-orientation");
  });
});

describe("<PeripheralsCheck />", () => {
  it("renders peripherals", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<PeripheralsCheck {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("peripherals");
  });

  it("handles missing config", () => {
    const wrapper = mount(<PeripheralsCheck {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("peripherals");
  });
});

describe("<FindHome />", () => {
  it("calls finds home", () => {
    const Component = FindHome("x");
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    config.body.encoder_enabled_x = 1;
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<Component {...p} />);
    clickButton(wrapper, 0, "find home x");
    expect(mockDevice.findHome).toHaveBeenCalledWith({ axis: "x", speed: 100 });
  });

  it("handles missing settings", () => {
    const Component = FindHome("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    clickButton(wrapper, 0, "find home x");
    expect(mockDevice.findHome).toHaveBeenCalledWith({ axis: "x", speed: 100 });
  });
});

describe("<SetHome />", () => {
  it("calls set home", () => {
    const Component = SetHome("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    clickButton(wrapper, 0, "set home x");
    expect(mockDevice.setZero).toHaveBeenCalledWith("x");
  });
});

describe("<CurrentPosition />", () => {
  it("renders current position", () => {
    const Component = CurrentPosition("x");
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<Component {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("current position");
  });

  it("handles missing settings", () => {
    const Component = CurrentPosition("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("current position");
  });
});

describe("<MotorMinSpeed />", () => {
  it("renders min speed", () => {
    const Component = MotorMinSpeed("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x-axis min");
  });
});

describe("<MotorMaxSpeed />", () => {
  it("renders min speed", () => {
    const Component = MotorMaxSpeed("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x-axis max");
  });
});

describe("<MotorAcceleration />", () => {
  it("renders acceleration", () => {
    const Component = MotorAcceleration("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x-axis acceleration");
  });
});

describe("<MotorCurrent />", () => {
  const state = fakeState();
  const config = fakeFirmwareConfig();
  state.resources = buildResourceIndex([config]);

  it("changes motor current", () => {
    const p = fakeProps();
    const fwConfig = fakeFirmwareConfig();
    fwConfig.body.movement_motor_current_x = 100;
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([fwConfig, fbosConfig]).index;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const Component = MotorCurrent("x");
    const wrapper = mount(<Component {...p} />);
    changeBlurableInput(wrapper, "200", 0);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      movement_motor_current_x: "200"
    });
  });

  it("handles missing settings", () => {
    const Component = MotorCurrent("x");
    const p = fakeProps();
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const wrapper = mount(<Component {...p} />);
    changeBlurableInput(wrapper, "100", 0);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      movement_motor_current_x: "100"
    });
  });
});

describe("<MotorSettings />", () => {
  it("renders all motor settings", () => {
    const Component = MotorSettings("x");
    const wrapper = mount(<Component {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("x-axis min");
    expect(wrapper.text().toLowerCase()).toContain("x-axis max");
    expect(wrapper.text().toLowerCase()).toContain("x-axis motor");
  });
});

describe("<CameraOffset />", () => {
  it("renders camera offset inputs", () => {
    const wrapper = mount(<CameraOffset {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("offset");
  });

  it("changes offset", () => {
    const wrapper = mount(<CameraOffset {...fakeProps()} />);
    changeBlurableInput(wrapper, "100", 0);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "CAMERA_CALIBRATION_camera_offset_x", value: "100"
    });
  });
});

describe("<CameraImageOrigin />", () => {
  it("renders image origin dropdown", () => {
    const wrapper = mount(<CameraImageOrigin {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("origin");
  });

  it("changes origin", () => {
    const wrapper = shallow(<CameraImageOrigin {...fakeProps()} />);
    wrapper.find("DropdownConfig").simulate("change",
      "CAMERA_CALIBRATION_image_bot_origin_location", 2);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "CAMERA_CALIBRATION_image_bot_origin_location", value: "\"TOP_LEFT\""
    });
  });
});

describe("<ToolCheck />", () => {
  it("renders tool verification button", () => {
    const wrapper = mount(<ToolCheck {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("verify");
  });
});

describe("<SensorsCheck />", () => {
  it("renders sensors", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([config]).index;
    const wrapper = mount(<SensorsCheck {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("sensors");
  });

  it("handles missing config", () => {
    const wrapper = mount(<SensorsCheck {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("sensors");
  });
});

describe("<CameraReplacement />", () => {
  it("renders camera replacement text and link", () => {
    const wrapper = mount(<CameraReplacement />);
    expect(wrapper.text().toLowerCase()).toContain("replacement");
  });
});

describe("<Tour />", () => {
  it("starts tour", () => {
    const p = fakeProps();
    const Component = Tour("gettingStarted");
    const wrapper = mount(<Component {...p} />);
    wrapper.find("button").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_TOUR, payload: "gettingStarted",
    });
    expect(push).toHaveBeenCalledWith(tourPath("", "gettingStarted", "intro"));
  });
});
