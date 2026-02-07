let mockIsMobile = false;
let mockDemo = false;

import React from "react";
import { mount } from "enzyme";
import { Connectivity, ConnectivityProps } from "../connectivity";
import { bot } from "../../../__test_support__/fake_state/bot";
import { StatusRowProps } from "../connectivity_row";
import { clone, cloneDeep } from "lodash";
import { fakePings } from "../../../__test_support__/fake_state/pings";
import { fakeDevice } from "../../../__test_support__/resource_index_builder";
import { fakeTimeSettings } from "../../../__test_support__/fake_time_settings";
import { ConnectionName } from "../diagnosis";
import { fakeAlert } from "../../../__test_support__/fake_state/resources";
import { clickButton } from "../../../__test_support__/helpers";
import { metricPanelState } from "../../../__test_support__/panel_state";
import { Actions } from "../../../constants";
import * as screenSize from "../../../screen_size";
import * as crud from "../../../api/crud";
import * as deviceActions from "../../actions";
import * as mustBeOnline from "../../must_be_online";

let isMobileSpy: jest.SpyInstance;
let refreshSpy: jest.SpyInstance;
let syncSpy: jest.SpyInstance;
let readStatusSpy: jest.SpyInstance;
let restartFirmwareSpy: jest.SpyInstance;
let forceOnlineSpy: jest.SpyInstance;

beforeEach(() => {
  mockIsMobile = false;
  mockDemo = false;
  isMobileSpy = jest.spyOn(screenSize, "isMobile").mockImplementation(() => mockIsMobile);
  refreshSpy = jest.spyOn(crud, "refresh").mockImplementation(jest.fn());
  restartFirmwareSpy = jest.spyOn(deviceActions, "restartFirmware")
    .mockImplementation(jest.fn());
  syncSpy = jest.spyOn(deviceActions, "sync").mockImplementation(jest.fn());
  readStatusSpy = jest.spyOn(deviceActions, "readStatus").mockImplementation(jest.fn());
  forceOnlineSpy = jest.spyOn(mustBeOnline, "forceOnline")
    .mockImplementation(() => mockDemo);
});

afterEach(() => {
  isMobileSpy.mockRestore();
  refreshSpy.mockRestore();
  restartFirmwareSpy.mockRestore();
  syncSpy.mockRestore();
  readStatusSpy.mockRestore();
  forceOnlineSpy.mockRestore();
});

describe("<Connectivity />", () => {
  const statusRow = {
    connectionName: "AB",
    from: "A",
    to: "B",
    connectionStatus: false,
    children: "Can't do things with stuff."
  };
  const rowData: StatusRowProps[] = [
    clone(statusRow),
    clone(statusRow),
    clone(statusRow),
    clone(statusRow),
    clone(statusRow),
  ];
  const flags = {
    userMQTT: false,
    userAPI: false,
    botMQTT: false,
    botAPI: false,
    botFirmware: false,
  };

  const fakeProps = (): ConnectivityProps => ({
    bot: cloneDeep(bot),
    rowData,
    flags,
    pings: fakePings(),
    dispatch: jest.fn(),
    device: fakeDevice(),
    alerts: [],
    apiFirmwareValue: undefined,
    timeSettings: fakeTimeSettings(),
    telemetry: [],
    metricPanelState: metricPanelState(),
  });

  it("show connectivity", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = false;
    p.metricPanelState.history = true;
    const wrapper = mount<Connectivity>(<Connectivity {...p} />);
    wrapper.instance().setPanelState("realtime")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_METRIC_PANEL_OPTION, payload: "realtime",
    });
  });

  it("shows history", () => {
    const p = fakeProps();
    p.metricPanelState.history = false;
    const wrapper = mount<Connectivity>(<Connectivity {...p} />);
    wrapper.instance().setPanelState("history")();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_METRIC_PANEL_OPTION, payload: "history",
    });
  });

  it("sets hovered connection", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    const wrapper = mount<Connectivity>(<Connectivity {...p} />);
    wrapper.instance().hover("AB")();
    wrapper.update();
    expect(wrapper.instance().state.hoveredConnection).toEqual("AB");
  });

  it("refreshes device", () => {
    const p = fakeProps();
    mount(<Connectivity {...p} />);
    expect(crud.refresh).toHaveBeenCalledWith(p.device);
    expect(deviceActions.sync).toHaveBeenCalled();
    expect(deviceActions.readStatus).toHaveBeenCalled();
  });

  it("doesn't refresh device", () => {
    mockDemo = true;
    mount(<Connectivity {...fakeProps()} />);
    expect(crud.refresh).not.toHaveBeenCalled();
    expect(deviceActions.sync).not.toHaveBeenCalled();
    expect(deviceActions.readStatus).not.toHaveBeenCalled();
  });

  it("displays fbos_version", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.controller_version = undefined;
    p.device.body.fbos_version = "1.0.0";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("version last seen: v1.0.0");
  });

  it("displays controller version", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.controller_version = "1.0.0";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("version: v1.0.0");
  });

  it("displays order number", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.device.body.fb_order_number = "FB1234";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("order number: fb1234");
  });

  it("displays order number as 'Unset' when undefined", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.device.body.fb_order_number = undefined;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("order number: unset");
  });

  it("renders network tab", () => {
    mockIsMobile = true;
    const p = fakeProps();
    p.metricPanelState.realtime = false;
    p.metricPanelState.network = true;
    p.bot.hardware.informational_settings.wifi_level_percent = 50;
    const wrapper = mount<Connectivity>(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("this phone");
    expect(wrapper.text().toLowerCase()).toContain("connection type: wifi");
  });

  it("displays more network info", () => {
    mockIsMobile = false;
    const p = fakeProps();
    p.metricPanelState.realtime = false;
    p.metricPanelState.network = true;
    p.flags.botAPI = true;
    p.bot.hardware.informational_settings.private_ip = "1.0.0.1";
    p.bot.hardware.informational_settings.node_name = "f-12345678";
    p.bot.hardware.informational_settings.wifi_level = undefined;
    p.bot.hardware.informational_settings.wifi_level_percent = undefined;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("1.0.0.1");
    expect(wrapper.text().toLowerCase()).toContain("b8:27:eb:34:56:78");
    expect(wrapper.text().toLowerCase()).toContain("this computer");
    expect(wrapper.text().toLowerCase()).toContain("connection type: unknown");
  });

  it("displays fix firmware buttons", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.apiFirmwareValue = "arduino";
    Object.keys(p.flags).map((key: ConnectionName) => p.flags[key] = true);
    p.flags.botFirmware = false;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.find(".fix-firmware-buttons").length).toBeGreaterThan(0);
    clickButton(wrapper, 2, "restart firmware");
  });

  it("doesn't display fix firmware buttons", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.apiFirmwareValue = undefined;
    Object.keys(p.flags).map((key: ConnectionName) => p.flags[key] = true);
    p.flags.botFirmware = false;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.find(".fix-firmware-buttons").length).toEqual(0);
  });

  it("displays firmware alerts", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    const alert = fakeAlert().body;
    alert.problem_tag = "farmbot_os.firmware.missing";
    p.alerts = [alert];
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("choose firmware");
  });

  it("displays sync status", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.sync_status = "syncing";
    p.rowData[3].connectionName = "botAPI";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.html()).toContain("fa-spinner");
  });

  it("displays camera status: missing value", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.video_devices = undefined;
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("camera: unknown");
  });

  it("displays camera status: no devices", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.video_devices = "";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("camera: unknown");
  });

  it("displays camera status: connected", () => {
    const p = fakeProps();
    p.metricPanelState.realtime = true;
    p.bot.hardware.informational_settings.video_devices = "1,0";
    const wrapper = mount(<Connectivity {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("camera: connected");
  });
});
