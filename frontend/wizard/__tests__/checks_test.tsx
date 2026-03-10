import { fakeState } from "../../__test_support__/fake_state";
import "@testing-library/jest-dom";

let mockState = fakeState();

const mockDevice = {
  execScript: jest.fn(() => Promise.resolve({})),
  findHome: jest.fn(() => Promise.resolve({})),
  setZero: jest.fn(() => Promise.resolve({})),
  emergencyUnlock: jest.fn(() => Promise.resolve({})),
  calibrate: jest.fn(() => Promise.resolve({})),
};

import React from "react";
import { fireEvent, render } from "@testing-library/react";
import type { ReactTestInstance } from "react-test-renderer";
import { bot } from "../../__test_support__/fake_state/bot";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import {
  AssemblyDocs,
  AutoUpdate,
  AxisActions,
  BootSequence,
  CameraCalibrationCard,
  CameraCalibrationCheck,
  CameraCheck,
  CameraImageOrigin,
  CameraOffset,
  CameraReplacement,
  Connectivity,
  ControlsCheck,
  ControlsCheckProps,
  DisableStallDetection,
  DownloadImager,
  DownloadOS,
  DynamicMapToggle,
  FindAxisLength,
  FindHome,
  FirmwareHardwareSelection,
  FlashFirmware,
  FlowRateInput,
  InvertJogButton,
  Language,
  lowVoltageProblemStatus,
  MapOrientation,
  MotorCurrentContent,
  NetworkRequirementsLink,
  PeripheralsCheck,
  PinBinding,
  RotateMapToggle,
  RpiSelection,
  SelectMapOrigin,
  SensorsCheck,
  SetHome,
  SlotCoordinateRows,
  SlotCoordinateRowsProps,
  SlotDropdownRows,
  SlotDropdownRowsProps,
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
  fakeFirmwareConfig, fakeImage, fakeLog, fakePinBinding, fakeTool,
  fakeToolSlot,
  fakeUser,
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { destroy, edit, initSave, save } from "../../api/crud";
import * as crud from "../../api/crud";
import { store } from "../../redux/store";
import * as device from "../../device";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import * as cameraCalibrationActions from "../../photos/camera_calibration/actions";
import { FarmwareName } from "../../sequences/step_tiles/tile_execute_script";
import { ExternalUrl } from "../../external_urls";
import { changeBlurableInputRTL } from "../../__test_support__/helpers";
import { Actions, SetupWizardContent } from "../../constants";
import { tourPath } from "../../help/tours";
import { BlurableInput } from "../../ui";
import * as ui from "../../ui";
import * as messageCards from "../../messages/cards";
import * as bootSequenceSelector from "../../settings/fbos_settings/boot_sequence_selector";
import * as messageActions from "../../messages/actions";
import * as deviceActions from "../../devices/actions";
import { DropdownConfig } from "../../photos/camera_calibration/config";
import { PLACEHOLDER_FARMBOT } from "../../photos/images/image_flipper";
import { createRenderer } from "../../__test_support__/test_renderer";

// Extend globalConfig with missing RPI properties - declared in hacks.d.ts
declare const globalConfig: Record<string, string>;
declare const mockNavigate: jest.Mock;

let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let originalGetState: typeof store.getState;
let originalDispatch: typeof store.dispatch;
let getDeviceSpy: jest.SpyInstance;
let calibrateSpy: jest.SpyInstance;
let bootSequenceSelectorSpy: jest.SpyInstance;
let seedAccountSpy: jest.SpyInstance;
let fbSelectSpy: jest.SpyInstance | undefined;
let changeFirmwareHardwareSpy: jest.SpyInstance | undefined;
let emergencyUnlockSpy: jest.SpyInstance;
let findHomeSpy: jest.SpyInstance;
let findAxisLengthSpy: jest.SpyInstance;

const findNodeByType = (
  node: React.ReactNode,
  matcher: (type: unknown) => boolean,
): ReactTestInstance | undefined => {
  if (!node || !React.isValidElement(node)) {
    return undefined;
  }
  try {
    return createRenderer(node).root
      .findAll(element => matcher(element.type))
      .filter(item => matcher(item.type))[0];
  } catch {
    return undefined;
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useRealTimers();
  mockState = fakeState();
  originalGetState = store.getState;
  originalDispatch = store.dispatch;
  (store as unknown as { getState: () => typeof mockState }).getState =
    () => mockState;
  (store as unknown as { dispatch: jest.Mock }).dispatch = jest.fn();
  editSpy = jest.spyOn(crud, "edit")
    .mockImplementation((resource: Record<string, unknown>, update: Record<string, unknown>) =>
      ({
        type: Actions.EDIT_RESOURCE,
        payload: { resource, update }
      }) as never);
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  getDeviceSpy = jest.spyOn(device, "getDevice")
    .mockImplementation(() => mockDevice as never);
  calibrateSpy = jest.spyOn(cameraCalibrationActions, "calibrate")
    .mockImplementation(jest.fn());
  bootSequenceSelectorSpy = jest.spyOn(
    bootSequenceSelector, "BootSequenceSelector")
    .mockImplementation(jest.fn(() => <div>boot</div>) as never);
  seedAccountSpy = jest.spyOn(messageActions, "seedAccount")
    .mockImplementation(jest.fn(x => () => x()) as never);
  changeFirmwareHardwareSpy = jest.spyOn(messageCards, "changeFirmwareHardware")
    .mockImplementation(() => jest.fn());
  emergencyUnlockSpy = jest.spyOn(deviceActions, "emergencyUnlock")
    .mockImplementation(jest.fn());
  findHomeSpy = jest.spyOn(deviceActions, "findHome")
    .mockImplementation(jest.fn());
  findAxisLengthSpy = jest.spyOn(deviceActions, "findAxisLength")
    .mockImplementation(jest.fn());
});

afterEach(() => {
  (store as unknown as { getState: typeof store.getState }).getState =
    originalGetState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch =
    originalDispatch;
  editSpy.mockRestore();
  saveSpy.mockRestore();
  initSaveSpy.mockRestore();
  destroySpy.mockRestore();
  getDeviceSpy.mockRestore();
  calibrateSpy.mockRestore();
  bootSequenceSelectorSpy.mockRestore();
  seedAccountSpy.mockRestore();
  fbSelectSpy?.mockRestore();
  emergencyUnlockSpy.mockRestore();
  findHomeSpy.mockRestore();
  findAxisLengthSpy.mockRestore();
  changeFirmwareHardwareSpy?.mockRestore();
});

const fakeProps = (): WizardStepComponentProps => ({
  setStepSuccess: jest.fn(() => jest.fn()),
  resources: buildResourceIndex([fakeDevice()]).index,
  bot: bot,
  dispatch: mockDispatch(),
  getConfigValue: jest.fn(),
});

describe("<Language />", () => {
  it("displays and changes setting", () => {
    const p = fakeProps();
    const user = fakeUser();
    user.body.language = undefined as unknown as string;
    p.resources = buildResourceIndex([user]).index;
    const input = createRenderer(<Language {...p} />)
      .root.findByType(BlurableInput);
    expect(input?.props.value || "").toEqual("");
    input?.props.onCommit({
      currentTarget: {
        value: "New Language",
      },
    } as never);
    expect(edit).toHaveBeenCalledWith(expect.any(Object),
      { language: "New Language" });
    expect(save).toHaveBeenCalledWith(user.uuid);
    user.body.language = undefined as unknown as string;
    p.resources = buildResourceIndex([user]).index;
    const updatedInput = createRenderer(<Language {...p} />)
      .root.findByType(BlurableInput);
    expect(updatedInput?.props.value || "").toEqual("");
  });
});

describe("<CameraCheck />", () => {
  it("clicks", () => {
    const p = fakeProps();
    const oldImage = fakeImage();
    oldImage.body.id = 1;
    p.resources = buildResourceIndex([oldImage]).index;
    const { container, rerender } = render(<CameraCheck {...p} />);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT);
    const newImage = fakeImage();
    newImage.body.attachment_url = "url";
    newImage.body.id = 10;
    p.resources = buildResourceIndex([newImage]).index;
    rerender(<CameraCheck {...p} />);
    expect(container.querySelector("img")?.getAttribute("src")).toEqual("url");
    fireEvent.click(container.querySelector(".camera-check") as Element);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT);
  });

  it("handles empty images", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([]).index;
    const { container } = render(<CameraCheck {...p} />);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT);
  });

  it("handles undefined fields", () => {
    const p = fakeProps();
    const log = fakeLog();
    log.body.created_at = undefined;
    p.resources = buildResourceIndex([fakeImage(), log, fakeLog()]).index;
    const { rerender, container } = render(<CameraCheck {...p} />);
    const image = fakeImage();
    image.body.id = undefined;
    p.resources = buildResourceIndex([image]).index;
    rerender(<CameraCheck {...p} />);
    expect(container.querySelector("img")?.getAttribute("src"))
      .toEqual(PLACEHOLDER_FARMBOT);
  });

  it("searches recent logs", () => {
    const p = fakeProps();
    const log0 = fakeLog();
    log0.body.message = "USB Camera not detected.";
    log0.body.created_at = 1;
    p.resources = buildResourceIndex([log0]).index;
    const { rerender, container } = render(<CameraCheck {...p} />);
    fireEvent.click(container.querySelector(".camera-check") as Element);
    expect(p.setStepSuccess).not.toHaveBeenCalled();
    const log1 = fakeLog();
    log1.body.message = "USB Camera not detected.";
    log1.body.created_at = 2;
    p.resources = buildResourceIndex([log1]).index;
    rerender(<CameraCheck {...p} />);
    expect(p.setStepSuccess).toHaveBeenCalledWith(false, "cameraError");
  });
});

describe("lowVoltageProblemStatus()", () => {
  it("returns problem", () => {
    mockState.bot.hardware.informational_settings.throttled = "0x50005";
    expect(lowVoltageProblemStatus()).toEqual(false);
  });

  it("returns ok", () => {
    mockState.bot.hardware.informational_settings.throttled = undefined;
    expect(lowVoltageProblemStatus()).toEqual(true);
  });
});

describe("<FlashFirmware />", () => {
  it("renders button", () => {
    const { container } = render(<FlashFirmware {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("flash firmware");
  });
});

describe("<ControlsCheck />", () => {
  const fakeControlsCheckProps = (): ControlsCheckProps => ({
    dispatch: jest.fn(),
    controlsCheckOptions: {},
  });

  it("returns controls", () => {
    const { container } = render(<ControlsCheck {...fakeControlsCheckProps()} />);
    expect(container.querySelector(".controls-check")).toBeInTheDocument();
  });

  it("returns highlighted controls", () => {
    const p = fakeControlsCheckProps();
    p.controlsCheckOptions.axis = "x";
    const { container } = render(<ControlsCheck {...p} />);
    expect(container.innerHTML).toContain("solid #fd6");
  });

  it("returns both controls directions highlighted", () => {
    const p = fakeControlsCheckProps();
    p.controlsCheckOptions.axis = "x";
    p.controlsCheckOptions.both = true;
    const { container } = render(<ControlsCheck {...p} />);
    expect(container.innerHTML).toContain("solid #fd6");
  });

  it("returns up controls direction highlighted", () => {
    const p = fakeControlsCheckProps();
    p.controlsCheckOptions.axis = "x";
    p.controlsCheckOptions.up = true;
    const { container } = render(<ControlsCheck {...p} />);
    expect(container.innerHTML).toContain("solid #fd6");
  });

  it("returns controls with home highlighted", () => {
    const p = fakeControlsCheckProps();
    p.controlsCheckOptions.home = true;
    const { container } = render(<ControlsCheck {...p} />);
    expect(container.innerHTML).toContain("solid #fd6");
  });
});

describe("<CameraCalibrationCard />", () => {
  it("renders grid", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "CAMERA_CALIBRATION_easy_calibration";
    farmwareEnv.body.value = "\"TRUE\"";
    p.resources = buildResourceIndex([farmwareEnv]).index;
    const { container } = render(<CameraCalibrationCard {...p} />);
    expect(container.innerHTML).toContain("svg");
    expect(container.innerHTML).toContain("back");
  });

  it("renders red dots", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "CAMERA_CALIBRATION_easy_calibration";
    farmwareEnv.body.value = "\"FALSE\"";
    p.resources = buildResourceIndex([farmwareEnv]).index;
    const { container } = render(<CameraCalibrationCard {...p} />);
    expect(container.innerHTML).toContain("svg");
    expect(container.innerHTML).toContain("front");
  });
});

describe("<SwitchCameraCalibrationMethod />", () => {
  it("changes method", () => {
    const p = fakeProps();
    const farmwareEnv = fakeFarmwareEnv();
    farmwareEnv.body.key = "CAMERA_CALIBRATION_easy_calibration";
    farmwareEnv.body.value = "\"TRUE\"";
    p.resources = buildResourceIndex([farmwareEnv]).index;
    const state = fakeState();
    state.resources = p.resources;
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch, () => state);
    const { container } = render(<SwitchCameraCalibrationMethod {...p} />);
    const checkbox = container.querySelector("input[type='checkbox']");
    fireEvent.click(checkbox as Element);
    expect(p.dispatch).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalled();
  });
});

describe("<CameraCalibrationCheck />", () => {
  it("calibrates", () => {
    bot.hardware.informational_settings.sync_status = "synced";
    bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const { container } = render(<CameraCalibrationCheck {...fakeProps()} />);
    fireEvent.click(container.querySelector(".camera-check") as Element);
    expect(cameraCalibrationActions.calibrate).toHaveBeenCalledWith(true);
  });
});

describe("<SoilHeightMeasurementCheck />", () => {
  it("shows message", () => {
    const { container } = render(<SoilHeightMeasurementCheck {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("missing");
  });

  it("runs", () => {
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const farmware = fakeFarmwareInstallation();
    farmware.body.id = 1;
    farmware.body.package = FarmwareName.MeasureSoilHeight;
    p.resources = buildResourceIndex([farmware]).index;
    const { container } = render(<SoilHeightMeasurementCheck {...p} />);
    const button = container.querySelector("button") as HTMLButtonElement;
    fireEvent.click(button);
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
    const { container } = render(<AssemblyDocs {...p} />);
    expect(container.querySelector("a")?.getAttribute("href"))
      .toEqual(ExternalUrl.genesisAssembly);
  });

  it("renders express link", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "express_k10";
    p.resources = buildResourceIndex([config]).index;
    const { container } = render(<AssemblyDocs {...p} />);
    expect(container.querySelector("a")?.getAttribute("href"))
      .toEqual(ExternalUrl.expressAssembly);
  });

  it("handles missing config", () => {
    const { container } = render(<AssemblyDocs {...fakeProps()} />);
    expect(container.querySelector("a")?.getAttribute("href"))
      .toEqual(ExternalUrl.genesisAssembly);
  });
});

describe("<DownloadOS />", () => {
  beforeEach(() => {
    // Set test values - both tags and URLs are needed (reset by bun test setup after each test)
    globalConfig.rpi_release_tag = "1.0.0";
    globalConfig.rpi_release_url = "http://example.com/rpi1.img";
    globalConfig.rpi3_release_tag = "3.0.0";
    globalConfig.rpi3_release_url = "http://example.com/rpi3.img";
    globalConfig.rpi4_release_tag = "4.0.0";
    globalConfig.rpi4_release_url = "http://example.com/rpi4.img";
  });

  it.each<[string, string]>([
    ["01", "1.0.0"],
    ["02", "3.0.0"],
    ["3", "3.0.0"],
    ["4", "4.0.0"],
  ])("shows correct link: %s", (rpi, expected) => {
    const p = fakeProps();
    const device = fakeDevice();
    device.body.rpi = rpi;
    p.resources = buildResourceIndex([device]).index;
    const { container } = render(<DownloadOS {...p} />);
    expect(container.textContent?.toLowerCase())
      .toContain(`download FBOS v${expected}`.toLowerCase());
  });

  it("handles missing model", () => {
    const p = fakeProps();
    const device = fakeDevice();
    device.body.rpi = undefined;
    p.resources = buildResourceIndex([device]).index;
    const { container } = render(<DownloadOS {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("please select a model");
  });
});

describe("<DownloadImager />", () => {
  it("renders link", () => {
    const { container } = render(<DownloadImager />);
    expect(container.textContent?.toLowerCase()).toContain("download");
  });
});

describe("<NetworkRequirementsLink />", () => {
  it("renders link", () => {
    const { container } = render(<NetworkRequirementsLink />);
    expect(container.textContent?.toLowerCase()).toContain("requirements");
  });
});

describe("<FirmwareHardwareSelection />", () => {
  const state = fakeState();
  const config = fakeFbosConfig();
  config.body.id = 1;
  state.resources.index = buildResourceIndex([config]);

  it("selects model", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.id = 1;
    const device = fakeDevice();
    p.resources = buildResourceIndex([config, device]).index;
    const dispatchState = { ...state, resources: { index: p.resources } as never };
    p.dispatch = mockDispatch(jest.fn(), () => dispatchState);
    const fbSelectProps: Array<{
      onChange: (ddi: {
        label: string;
        value: string;
      }) => void
    }> = [];
    fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation((props: {
        onChange: {
          (ddi: { label: string; value: string; }): void;
        };
      }) => {
        fbSelectProps.push(props);
        return <div />;
      });
    render(<FirmwareHardwareSelection {...p} />);
    const select = fbSelectProps.at(-1);
    expect(select).toBeTruthy();
    select?.onChange({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), { rpi: "3" });
  });

  it("seeds account", () => {
    const p = fakeProps();
    const fbSelectProps: Array<{
      onChange: (ddi: {
        label: string;
        value: string;
      }) => void
    }> = [];
    fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation((props: {
        onChange: {
          (ddi: { label: string; value: string; }): void;
        };
      }) => {
        fbSelectProps.push(props);
        return <div />;
      });
    const alert = fakeAlert();
    alert.body.id = 1;
    alert.body.problem_tag = "api.seed_data.missing";
    const config = fakeFbosConfig();
    config.body.id = 1;
    const device = fakeDevice();
    p.resources = buildResourceIndex([alert, config, device]).index;
    const dispatchState = { ...state, resources: { index: p.resources } as never };
    p.dispatch = mockDispatch(jest.fn(), () => dispatchState);
    const { rerender } = render(<FirmwareHardwareSelection {...p} />);
    const select = fbSelectProps.at(-1);
    select?.onChange({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), { rpi: "3" });
    expect(save).toHaveBeenCalledWith(device.uuid);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(messageActions.seedAccount).toHaveBeenCalledTimes(1);
    rerender(<FirmwareHardwareSelection {...p} />);
    const selectAfterReselect = fbSelectProps.at(-1);
    selectAfterReselect?.onChange({ label: "Genesis v1.3", value: "genesis_1.3" });
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), { rpi: "3" });
    expect(save).toHaveBeenCalledWith(device.uuid);
    expect(destroy).toHaveBeenCalledTimes(1);
    expect(messageActions.seedAccount).toHaveBeenCalledTimes(1);
  });

  it("doesn't seed account", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.id = 1;
    const device = fakeDevice();
    device.body.account_seeded_at = "2023-01-01T11:22:33.000Z";
    p.resources = buildResourceIndex([config, device]).index;
    const dispatchState = { ...state, resources: { index: p.resources } as never };
    p.dispatch = mockDispatch(jest.fn(), () => dispatchState);
    const fbSelectProps: Array<{
      onChange: (ddi: {
        label: string;
        value: string;
      }) => void
    }> = [];
    fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation((props: {
        onChange: {
          (ddi: { label: string; value: string; }): void;
        };
      }) => {
        fbSelectProps.push(props);
        return <div />;
      });
    render(<FirmwareHardwareSelection {...p} />);
    const select = fbSelectProps.at(-1);
    expect(select).toBeTruthy();
    select?.onChange({ label: "Genesis v1.2", value: "genesis_1.2" });
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), { rpi: "3" });
    expect(save).toHaveBeenCalledWith(device.uuid);
    expect(destroy).not.toHaveBeenCalled();
    expect(messageActions.seedAccount).not.toHaveBeenCalled();
  });

  it("toggles auto-seed", () => {
    const p = fakeProps();
    const alert = fakeAlert();
    alert.body.id = 1;
    alert.body.problem_tag = "api.seed_data.missing";
    const device = fakeDevice();
    p.resources = buildResourceIndex([alert, device]).index;
    const { container } = render(<FirmwareHardwareSelection {...p} />);
    expect(container.textContent).toContain(SetupWizardContent.SEED_DATA);
    fireEvent.click(container.querySelector("input[type='checkbox']") as Element);
    expect(container.textContent).not.toContain(SetupWizardContent.SEED_DATA);
  });
});

describe("<RpiSelection />", () => {
  it("changes rpi model", () => {
    const p = fakeProps();
    const state = fakeState();
    state.resources = p.resources;
    p.dispatch = jest.fn();
    const fbSelectProps: Array<{
      onChange: (ddi: {
        label: string;
        value: string;
      }) => void
    }> = [];
    fbSelectSpy = jest.spyOn(ui, "FBSelect")
      .mockImplementation((props: {
        onChange: {
          (ddi: { label: string; value: string; }): void;
        };
      }) => {
        fbSelectProps.push(props);
        return <div />;
      });
    render(<RpiSelection {...p} />);
    const select = fbSelectProps.at(-1);
    expect(select).toBeTruthy();
    select?.onChange({ label: "", value: "3" });
    expect(editSpy).toHaveBeenCalledWith(expect.any(Object), { rpi: "3" });
    expect(p.dispatch).toHaveBeenCalled();
  });
});

describe("<Connectivity />", () => {
  it("renders diagram", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([fakeDevice(), config]).index;
    const { container } = render(<Connectivity {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("web app");
  });

  it("handles missing config", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([fakeDevice()]).index;
    const { container } = render(<Connectivity {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("web app");
  });
});

describe("<AutoUpdate />", () => {
  it("renders OTA time selector", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.os_auto_update = true;
    const device = fakeDevice();
    device.body.ota_hour = 1;
    p.resources = buildResourceIndex([config, device]).index;
    const { container } = render(<AutoUpdate {...p} />);
    expect(container.textContent).toContain("1:00 AM");
  });
});

describe("<DisableStallDetection />", () => {
  const state = fakeState();
  const config = fakeFirmwareConfig();
  config.body.id = 1;
  state.resources = buildResourceIndex([config]);

  it("disables stall detection", () => {
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    config.body.id = 1;
    config.body.encoder_enabled_x = 0;
    p.resources = buildResourceIndex([config]).index;
    p.dispatch = jest.fn();
    const { container } = render(DisableStallDetection("x")(p));
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.dispatch).toHaveBeenCalled();
  });
});

describe("<InvertJogButton />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.x_axis_inverted = false;
  state.resources = buildResourceIndex([config]);

  it("inverts button", () => {
    const p = fakeProps();
    p.resources = state.resources;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const { container } = render(InvertJogButton("x")(p));
    fireEvent.click(container.querySelector("button") as Element);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), {
      x_axis_inverted: true,
    });
  });
});

describe("<MotorCurrentContent />", () => {
  it("returns content", () => {
    const { container } = render(<MotorCurrentContent />);
    expect(container.textContent?.toLowerCase()).toContain("motor current");
  });
});

describe("<SwapJogButton />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.xy_swap = false;
  state.resources = buildResourceIndex([config]);

  it("swaps buttons", () => {
    const p = fakeProps();
    p.resources = state.resources;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const { container } = render(<SwapJogButton {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
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
    p.resources = state.resources;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const { container } = render(<RotateMapToggle {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { xy_swap: true });
  });
});

describe("<DynamicMapToggle />", () => {
  const state = fakeState();
  const config = fakeWebAppConfig();
  config.body.xy_swap = false;
  state.resources = buildResourceIndex([config]);

  it("toggles dynamic map size", () => {
    const p = fakeProps();
    p.resources = state.resources;
    p.dispatch = mockDispatch(jest.fn(), () => state);
    const { container } = render(<DynamicMapToggle {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { dynamic_map: true });
  });
});

describe("<SelectMapOrigin />", () => {
  it("renders origin selector", () => {
    const { container } = render(<SelectMapOrigin {...fakeProps()} />);
    expect(container.innerHTML).toContain("farmbot-origin");
  });
});

describe("<MapOrientation />", () => {
  it("renders map settings", () => {
    const { container } = render(<MapOrientation {...fakeProps()} />);
    expect(container.innerHTML).toContain("map-orientation");
  });
});

describe("<PeripheralsCheck />", () => {
  it("renders peripherals", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([config]).index;
    const { container } = render(<PeripheralsCheck {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("peripherals");
  });

  it("handles missing config", () => {
    const { container } = render(<PeripheralsCheck {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("peripherals");
  });
});

describe("<PinBinding />", () => {
  it("renders pin binding inputs", () => {
    const checks = jest.requireActual("../checks");
    const { PinBinding: ActualPinBinding } = checks;
    const p = fakeProps();
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "farmduino_k17";
    const pinBinding = fakePinBinding();
    p.resources = buildResourceIndex([pinBinding, fbosConfig]).index;
    p.getConfigValue = () => false;
    const { container } = render(<ActualPinBinding {...p}
      pinBindingOptions={{ editing: false }} />);
    expect(container.querySelector(".electronics-box-top")).toBeInTheDocument();
  });

  it("unlocks the device", () => {
    window.confirm = () => true;
    const { container } = render(<PinBinding {...fakeProps()}
      pinBindingOptions={{ editing: false, unlockOnly: true }} />);
    expect(container.textContent?.toLowerCase()).toEqual("unlock");
    fireEvent.click(container.querySelector("button") as Element);
    expect(deviceActions.emergencyUnlock).toHaveBeenCalled();
  });
});

describe("<FindHome />", () => {
  it("calls finds home", () => {
    const Component = FindHome("x");
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const config = fakeFirmwareConfig();
    config.body.encoder_enabled_x = 1;
    p.resources = buildResourceIndex([config]).index;
    const { container } = render(<Component {...p} />);
    fireEvent.click(container.querySelector(".wizard-find-home-btn") as Element);
    expect(deviceActions.findHome).toHaveBeenCalledWith("x");
  });

  it("handles missing settings", () => {
    const Component = FindHome("x");
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const { container } = render(<Component {...p} />);
    fireEvent.click(container.querySelector(".wizard-find-home-btn") as Element);
    expect(deviceActions.findHome).toHaveBeenCalledWith("x");
  });
});

describe("<SetHome />", () => {
  it("calls set home", () => {
    const Component = SetHome("x");
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const { container } = render(<Component {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(mockDevice.setZero).toHaveBeenCalledWith("x");
  });
});

describe("<AxisActions />", () => {
  it("renders current position", () => {
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    p.resources = buildResourceIndex([config]).index;
    const { container } = render(<AxisActions {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("position (mm)");
  });

  it("handles missing settings", () => {
    const { container } = render(<AxisActions {...fakeProps()} />);
    expect(container.textContent?.toLowerCase())
      .not.toContain("position (mm)");
  });
});

describe("<FindAxisLength />", () => {
  it("has config", () => {
    const p = fakeProps();
    const config = fakeFirmwareConfig();
    config.body.encoder_enabled_x = 0;
    p.resources = buildResourceIndex([config]).index;
    const Component = FindAxisLength("x");
    const { container } = render(<Component {...p} />);
    expect((container.querySelector("button") as HTMLButtonElement).disabled)
      .toBeTruthy();
  });

  it("finds length", () => {
    const Component = FindAxisLength("x");
    const p = fakeProps();
    p.bot.hardware.informational_settings.sync_status = "synced";
    p.bot.connectivity.uptime["bot.mqtt"] = { state: "up", at: 1 };
    const { container } = render(<Component {...p} />);
    fireEvent.click(container.querySelector(".wizard-find-length-btn") as Element);
    expect(deviceActions.findAxisLength).toHaveBeenCalledWith("x");
  });
});

describe("<BootSequence />", () => {
  it("renders boot sequence", () => {
    const { container } = render(<BootSequence />);
    expect(container.textContent?.toLowerCase()).toContain("boot");
  });
});

describe("<CameraOffset />", () => {
  it("renders camera offset inputs", () => {
    const { container } = render(<CameraOffset {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("offset");
  });

  it("changes offset", () => {
    const { container } = render(<CameraOffset {...fakeProps()} />);
    const inputs = container.querySelectorAll("input");
    changeBlurableInputRTL(inputs[0] as HTMLElement, "100");
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "CAMERA_CALIBRATION_camera_offset_x", value: "100",
    });
  });
});

describe("<CameraImageOrigin />", () => {
  it("renders image origin dropdown", () => {
    const { container } = render(<CameraImageOrigin {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("origin");
  });

  it("changes origin", () => {
    const p = fakeProps();
    const origin = findNodeByType(<CameraImageOrigin {...p} />,
      type => type === DropdownConfig);
    origin?.props.onChange(
      "CAMERA_CALIBRATION_image_bot_origin_location", 2);
    expect(initSave).toHaveBeenCalledWith("FarmwareEnv", {
      key: "CAMERA_CALIBRATION_image_bot_origin_location",
      value: "\"TOP_LEFT\"",
    });
  });
});

describe("<FlowRateInput />", () => {
  it("adds new tool", () => {
    const p = fakeProps();
    p.resources = buildResourceIndex([]).index;
    const { container } = render(<FlowRateInput {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(initSave).toHaveBeenCalledWith("Tool", { name: "Watering Nozzle" });
  });

  it("changes flow rate", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = "watering nozzle";
    p.resources = buildResourceIndex([tool]).index;
    const { container } = render(<FlowRateInput {...p} />);
    const input = container.querySelector("input") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "100" } });
    expect(edit).toHaveBeenCalledWith(tool, { flow_rate_ml_per_s: 100 });
    expect(save).toHaveBeenCalledWith(tool.uuid);
  });
});

describe("<ToolCheck />", () => {
  it("renders tool verification button", () => {
    const { container } = render(<ToolCheck {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("verify");
  });
});

describe("<SensorsCheck />", () => {
  it("renders sensors", () => {
    const p = fakeProps();
    const config = fakeFbosConfig();
    config.body.firmware_hardware = "arduino";
    p.resources = buildResourceIndex([config]).index;
    const { container } = render(<SensorsCheck {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("sensors");
  });

  it("handles missing config", () => {
    const { container } = render(<SensorsCheck {...fakeProps()} />);
    expect(container.textContent?.toLowerCase()).toContain("sensors");
  });
});

describe("<CameraReplacement />", () => {
  it("renders camera replacement text and link", () => {
    const { container } = render(<CameraReplacement />);
    expect(container.textContent?.toLowerCase()).toContain("replacement");
  });
});

describe("<SlotCoordinateRows />", () => {
  const fakeProps = (): SlotCoordinateRowsProps => ({
    resources: buildResourceIndex([fakeDevice(), fakeToolSlot()]).index,
    bot: bot,
    dispatch: jest.fn(),
    indexValues: [0],
  });

  it("updates slot", () => {
    const p = fakeProps();
    const { container } = render(<SlotCoordinateRows {...p} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toEqual(3);
    changeBlurableInputRTL(inputs[0] as HTMLElement, "100");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { x: 100 });
    expect(save).toHaveBeenCalledWith(expect.any(String));
    expect(container.textContent).toContain("Slot 1");
  });

  it("handles missing slots", () => {
    const p = fakeProps();
    p.indexValues = [0, 1];
    const { container } = render(<SlotCoordinateRows {...p} />);
    expect(container.textContent).toContain("Slot 1");
  });
});

describe("<SlotDropdownRows />", () => {
  const fakeProps = (): SlotDropdownRowsProps => ({
    resources: buildResourceIndex([fakeDevice(), fakeToolSlot(), fakeTool()]).index,
    bot: bot,
    dispatch: jest.fn(),
    indexValues: [0],
  });

  it("shows slots", () => {
    const p = fakeProps();
    const { container } = render(<SlotDropdownRows {...p} />);
    expect(container.textContent).toContain("Slot 1");
  });

  it("handles missing slots", () => {
    const p = fakeProps();
    p.indexValues = [0, 1];
    const { container } = render(<SlotDropdownRows {...p} />);
    expect(container.textContent).toContain("Slot 1");
  });
});

describe("<Tour />", () => {
  it("starts tour", () => {
    const p = fakeProps();
    const Component = Tour("gettingStarted");
    const { container } = render(<Component {...p} />);
    fireEvent.click(container.querySelector("button") as Element);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_TOUR, payload: "gettingStarted",
    });
    expect(mockNavigate).toHaveBeenCalledWith(
      tourPath("", "gettingStarted", "intro"));
  });
});
