import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { buildCommands, validNumberInput } from "../commands";
import { fakeState } from "../../__test_support__/fake_state";
import {
  Actions, CAMERA_FOLLOW_PERSPECTIVE_REQUIRED, Content, DeviceSetting,
  UTM_FOLLOW_PERSPECTIVE_REQUIRED,
} from "../../constants";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakePeripheral, fakePlant, fakePoint,
  fakeCurve, fakePointGroup, fakeRegimen, fakeSavedGarden, fakeSceneObject,
  fakeSensor, fakeSequence, fakeTool, fakeToolSlot, fakeWebAppConfig, fakeWeed,
} from "../../__test_support__/fake_state/resources";
import {
  buildResourceIndex, fakeDevice,
} from "../../__test_support__/resource_index_builder";
import * as deviceActions from "../../devices/actions";
import * as folderActions from "../../folders/actions";
import { SpecialStatus, TaggedCrop } from "farmbot";
import { Panel, TAB_ICON } from "../../farm_designer/panel_header";
import { searchCommands } from "../search";
import { Path } from "../../internal_urls";
import { ExternalUrl } from "../../external_urls";
import * as crud from "../../api/crud";
import * as configStorageActions from "../../config_storage/actions";
import * as sequenceActions from "../../sequences/actions";
import * as regimenActions from "../../regimens/copy_regimen";
import * as regimenListActions from "../../regimens/list/add_regimen";
import { BooleanSetting } from "../../session_keys";
import {
  selectAllPeripherals, selectAllPlantPointers, selectAllRegimens,
  selectAllSequences, selectAllToolSlotPointers, selectAllCurves,
  selectAllGenericPointers, selectAllPointGroups, selectAllSavedGardens,
  selectAllSceneObjects, selectAllSensors, selectAllTools,
  selectAllWeedPointers,
} from "../../resources/selectors";
import { farmEventSchedulePath } from "../../farm_events/navigation";
import * as logoutActions from "../../logout";
import * as savedGardenActions from "../../saved_gardens/actions";
import * as threeDSettings from "../../settings/three_d_settings";
import { findCropIcon } from "../../crops/metadata";
import { Command } from "../interfaces";
import { getWebAppConfig } from "../../resources/getters";
import * as photoActions from "../../photos/actions";
import * as screenSize from "../../screen_size";
import * as toast from "../../toast/toast";

const firstInputOptions = (command: Command | undefined) =>
  command?.actions?.[0].input?.fields[0].options || [];

describe("buildCommands()", () => {
  const stateWithResources = () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 101;
    const slot = fakeToolSlot();
    slot.body.id = 102;
    slot.body.tool_id = tool.body.id;
    const digital = fakePeripheral();
    digital.body.label = "Lighting";
    const analog = fakePeripheral();
    analog.body.mode = 1;
    analog.body.pin = 2;
    const water = fakePeripheral();
    water.body.label = "Water";
    water.body.pin = 3;
    const vacuum = fakePeripheral();
    vacuum.body.label = "Vacuum";
    vacuum.body.pin = 4;
    const sensor = fakeSensor();
    sensor.body.label = "GPIO 52 - Tool Verification";
    sensor.body.pin = 52;
    const regimen = fakeRegimen();
    regimen.body.id = 208;
    const curve = fakeCurve();
    curve.body.id = 301;
    const group = fakePointGroup();
    group.body.id = 302;
    const garden = fakeSavedGarden();
    garden.body.id = 303;
    const sceneObject = fakeSceneObject();
    sceneObject.body.id = 304;
    const crop: TaggedCrop = {
      kind: "Crop",
      uuid: "Crop.api-crop.1",
      specialStatus: SpecialStatus.SAVED,
      body: { id: 1, slug: "api-only-crop" },
    };
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.update_channel = "stable";
    fbosConfig.body.sequence_init_log = true;
    state.resources = buildResourceIndex([
      fakeDevice(), fakeWebAppConfig(), fbosConfig, fakeFirmwareConfig(),
      fakeSequence(), regimen, fakePlant(),
      fakePoint(), fakeWeed(), tool, slot, digital, analog, water, vacuum,
      sensor, crop, curve, group, garden, sceneObject,
    ]);
    state.bot.hardware.pins[1] = { value: 1, mode: 0 };
    state.bot.hardware.pins[2] = { value: 5, mode: 1 };
    state.bot.hardware.pins[3] = { value: 0, mode: 0 };
    state.bot.hardware.pins[4] = { value: 0, mode: 0 };
    return state;
  };

  it("adds icons and aliases to named peripheral toggles", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const expectations = [
      ["Lighting", ["Lights", "LED Strip"]],
      ["Vacuum", ["Vacuum Pump", "Air", "Suction", "Seeder"]],
      ["Water", ["Solenoid Valve", "Watering Nozzle"]],
    ] as const;
    expectations.map(([label, aliases]) => {
      const command = commands.find(item =>
        item.englishName == label);
      expect(command).toMatchObject({ icon: "toggle-on" });
      expect(command?.aliases).toEqual(expect.arrayContaining([
        "peripheral", `Peripheral ${label}`,
        `Toggle peripheral ${label}`, ...aliases,
      ]));
      aliases.map(alias => expect(searchCommands(commands, alias))
        .toContain(command));
    });
  });

  // eslint-disable-next-line complexity
  it("builds a comprehensive registry with stable unique ids", () => {
    const state = fakeState();
    const commands = buildCommands({
      state,
      dispatch: jest.fn(),
      navigate: jest.fn(),
    });
    const ids = commands.map(command => command.id);
    expect(new Set(ids).size).toEqual(ids.length);
    expect(commands.some(command =>
      command.englishName.startsWith("Toggle "))).toEqual(false);
    expect(ids).toContain("panel");
    expect(ids).toContain("panel:map");
    expect(ids).toContain("popup:controls");
    expect(ids).toContain("time-travel");
    expect(ids).not.toContain("popup:timeTravel");
    expect(ids).toContain("logs:delete-all");
    expect(ids).toContain("recents:clear");
    expect(commands.find(command => command.id == "recents:clear"))
      .toMatchObject({
        name: "Clear Recent Commands",
        recordRecent: false,
      });
    expect(ids).toContain("logout");
    expect(ids).not.toContain("controls:peripherals");
    expect(ids).not.toContain("section:plants:groups");
    expect(ids).not.toContain("section:photos:filter");
    expect(ids).not.toContain("section:connectivity:history");
    expect(ids).toContain("section-view");
    expect(ids).toContain("select");
    expect(ids).not.toContain("setting:legend_menu_open:toggle");
    expect(ids).toContain("settings-section:axis_settings");
    expect(ids).toContain("settings-item:set-axis-length");
    expect(ids).toContain("setting:show_plants:toggle");
    expect(ids).not.toContain("setting:show_plants:on");
    expect(ids).not.toContain("setting:show_plants:off");
    expect(ids).toContain("camera:orbit:top");
    expect(ids).toContain("camera:orbit:corner");
    expect(ids).toContain("camera:orbit:side");
    expect(ids).toContain("farmbot:move:x");
    expect(ids).toContain("farmbot:move:z");
    expect(ids).toContain("farmbot:move-to:coordinates");
    expect(ids).toContain("farmbot:camera");
    expect(ids).toContain("farmbot:power");
    expect(ids).not.toContain("farmbot:status");
    expect(ids).not.toContain("farmbot:verify-tool");
    expect(ids).not.toContain("farmbot:calibrate-camera");
    expect(ids).not.toContain("farmbot:reboot");
    expect(ids).not.toContain("profile:profile");
    expect(ids).not.toContain("add:group");
    expect(ids).not.toContain("add:garden");
    expect(ids).not.toContain("add:farmware");
    expect(ids).not.toContain("add:zone");
    [1, 2, 3, 4, 5].map(index =>
      expect(ids).not.toContain(
        `firmware-setting:pin-guard-${index}:set`));
    expect(ids).not.toContain("add:curve:water");
    expect(ids).not.toContain("add:sequence");
    expect(ids).toContain("add:crop:tomato");
    expect(ids).toContain("setup-wizard");
    expect(ids).toContain("shop");
    expect(ids).toContain("follow-farmbot");
    expect(commands.find(command => command.id == "documentation"))
      .toMatchObject({
        name: "Docs",
        aliases: expect.arrayContaining(["Documentation"]),
      });
    expect(ids).toContain("panel:help");
    expect(commands.find(command => command.id == "panel:plants")
      ?.imageIcon).toEqual(TAB_ICON[Panel.Plants]);
    const darkMode = commands.find(command =>
      command.id == "setting:dark_mode:toggle");
    expect(darkMode).toMatchObject({
      name: "Dark Mode",
      imageIcon: TAB_ICON[Panel.Settings],
    });
    expect(commands.find(command => command.id == "add:crop:tomato")
      ?.imageIcon).toContain("tomato");
    expect(commands.find(command => command.id == "panel:sequences")
      ?.actions?.map(action => action.name))
      .toEqual(["Add New", "Open Panel", "Sequences", "Featured"]);
    expect(commands.find(command => command.id == "popup:connectivity")?.name)
      .toEqual("Connectivity");
    expect(commands.find(command => command.id == "popup:controls"))
      .toMatchObject({
        imageIcon: TAB_ICON[Panel.Controls],
        themeAwareImageIcon: true,
      });
    expect(commands.find(command => command.id == "time-travel"))
      .toMatchObject({
        name: "Time travel",
        icon: "clock-o",
      });
    expect(commands.find(command => command.id == "logs:delete-all"))
      .toMatchObject({
        name: "Delete all logs",
        imageIcon: TAB_ICON[Panel.Logs],
        themeAwareImageIcon: true,
      });
    expect(commands.find(command => command.id == "popup:connectivity")?.icon)
      .toEqual("wifi");
    expect(commands.find(command => command.id == "farmbot:estop"))
      .toMatchObject({
        icon: "pause", priority: 2, accessory: expect.any(Function),
      });
    expect(commands.find(command => command.id == "farmbot:unlock"))
      .toMatchObject({
        icon: "unlock", priority: 1, accessory: expect.any(Function),
      });
    expect(commands.find(command => command.id == "farmbot:camera"))
      .toMatchObject({
        imageIcon: TAB_ICON[Panel.Photos],
        themeAwareImageIcon: true,
      });
    expect(commands.find(command =>
      command.id == "popup:connectivity")?.icon).toEqual("wifi");
    expect(commands.find(command => command.id == "popup:jobs")?.icon)
      .toEqual("history");
    expect(commands.find(command => command.id == "popup:jobs")?.name)
      .toEqual("Jobs and Logs");
    expect(commands.find(command => command.id == "shop")).toMatchObject({
      name: "Shop",
      imageIcon: TAB_ICON[Panel.Shop],
      themeAwareImageIcon: true,
    });
    expect(commands.find(command => command.id == "follow-farmbot"))
      .toMatchObject({
        name: "Follow FarmBot",
        imageIcon: expect.stringContaining("favicon"),
        imageIconClass: "farmbot-favicon",
      });
    expect(commands.find(command =>
      command.id == "add:crop:bishops-crown-pepper")?.name)
      .toEqual("Bishop's Crown Pepper");
    expect(commands.find(command =>
      command.id == "add:crop:bishops-crown-pepper")
      ?.actions?.map(action => action.name))
      .toEqual(["Add new", "Add grid", "Add at current location"]);
    expect(commands.find(command => command.id == "panel:points")
      ?.actions?.map(action => action.name))
      .toEqual([
        "Add New", "Add Grid", "Open Panel", "Groups", "Points",
        "Soil Height",
      ]);
  });

  it("combines related commands in the requested option order", () => {
    jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const actions = (id: string) => commands.find(command =>
      command.id == id)?.actions?.map(action => action.name);
    expect(actions("panel:plants")).toEqual([
      "Add New", "Open Panel", "Plants", "Groups", "Gardens",
    ]);
    expect(actions("panel:weeds")).toEqual([
      "Add New", "Open Panel", "Groups", "Pending", "Active", "Removed",
    ]);
    expect(actions("panel:points")).toEqual([
      "Add New", "Add Grid", "Open Panel", "Groups", "Points", "Soil Height",
    ]);
    expect(actions("panel:points")).not.toContain("Add at current location");
    expect(actions("panel:curves")).toEqual([
      "Add Water", "Add Spread", "Add Height",
      "Open Panel",
    ]);
    expect(actions("panel:sequences")).toEqual([
      "Add New", "Open Panel", "Sequences", "Featured",
    ]);
    expect(actions("popup:controls")).toEqual([
      "Open Panel", "Move", "Peripherals", "Webcams",
    ]);
    expect(actions("popup:connectivity")).toEqual([
      "Open Panel", "Realtime", "Network", "History",
    ]);
    expect(actions("panel:photos")).toEqual([
      "Open Panel", "Filters", "Settings", "Calibration",
      "Weed detection", "Measure soil height",
    ]);
    expect(actions("documentation")).toEqual([
      "Software", "Developer", "Genesis", "Express", "Education", "Business",
    ]);
    expect(actions("panel:help")).toEqual([
      "Get Help", "Take a Tour", "Hotkeys",
    ]);
    expect(actions("shop")).toEqual([
      "Buy Parts", "Full Kits", "Home", "Blog",
    ]);
    expect(actions("follow-farmbot")).toEqual([
      "Subscribe to our Newsletter", "Blog",
    ]);
    expect(actions("panel:scene_objects")).toEqual([
      "Add New", "Add Custom", "Open Panel",
    ]);
    [
      "panel:regimens", "panel:events", "panel:sensors",
    ].map(id => expect(actions(id)).toEqual(["Add New", "Open Panel"]));
    expect(actions("panel:tools")).toEqual([
      "Verify Tool", "Open Panel", "Add Tool", "Add Tool Slot",
    ]);
    expect(actions("farmbot:camera")).toEqual([
      "Take Photo", "Detect Weeds", "Measure Soil Height", "Calibrate",
    ]);
    expect(actions("farmbot:power")).toEqual([
      "Reboot FarmBot", "Restart Firmware", "Shutdown FarmBot",
    ]);
    expect(actions("camera:view")).toEqual([
      "Toggle Perspective", "Reset", "Follow Camera", "Follow UTM",
    ]);
  });

  it("executes combined panel opening and creation options", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    jest.spyOn(folderActions, "addNewSequenceToFolder")
      .mockImplementation(jest.fn());
    const addRegimen = jest.spyOn(regimenListActions, "addRegimen")
      .mockReturnValue("add-regimen" as never);
    const commands = buildCommands({
      state: stateWithResources(), dispatch, navigate,
    });
    const execute = (commandId: string, actionId: string) =>
      commands.find(command => command.id == commandId)
        ?.actions?.find(action => action.id == actionId)?.execute();

    execute("popup:controls", "open-panel");
    execute("popup:connectivity", "open-panel");
    execute("panel:weeds", "add-new");
    execute("panel:scene_objects", "add-new");
    execute("panel:scene_objects", "add-custom");
    execute("panel:regimens", "add-new");
    execute("panel:events", "add-new");
    execute("panel:sensors", "add-new");
    execute("panel:tools", "add-tool");
    execute("panel:tools", "add-tool-slot");

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP, payload: "controls",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP, payload: "connectivity",
    });
    expect(navigate).toHaveBeenCalledWith(Path.sceneObjects("catalog"));
    expect(navigate).toHaveBeenCalledWith(Path.sceneObjects("add"));
    expect(navigate).toHaveBeenCalledWith(Path.weeds("add"));
    expect(addRegimen).toHaveBeenCalledWith(1, navigate);
    expect(navigate).toHaveBeenCalledWith(Path.farmEvents("add"));
    expect(navigate).toHaveBeenCalledWith(Path.sensors());
    expect(navigate).toHaveBeenCalledWith(Path.tools("add"));
    expect(navigate).toHaveBeenCalledWith(Path.toolSlots("add"));
  });

  it("uses concise safety command names and emergency aliases", () => {
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    expect(commands.find(command => command.id == "farmbot:estop")?.name)
      .toEqual("E-Stop");
    expect(commands.find(command => command.id == "farmbot:unlock")?.name)
      .toEqual("Unlock");
    expect(searchCommands(commands, "Emergency stop")
      .map(command => command.id)).toContain("farmbot:estop");
    ["Stop", "Estop"].map(alias =>
      expect(searchCommands(commands, alias).map(command => command.id))
        .toContain("farmbot:estop"));
    expect(searchCommands(commands, "Emergency unlock")
      .map(command => command.id)).toContain("farmbot:unlock");
  });

  it("includes keyboard help on larger screens", () => {
    const isMobile = jest.spyOn(screenSize, "isMobile").mockReturnValue(false);
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const hotkeys = commands.find(command => command.id == "panel:help")
      ?.actions?.find(action => action.id == "hotkeys");
    expect(hotkeys).toMatchObject({ name: "Hotkeys" });
    hotkeys?.execute();
    hotkeys?.execute();
    isMobile.mockRestore();
  });

  it("confirms camera calibration", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const calibrate = jest.spyOn(photoActions, "calibrateCamera")
      .mockImplementation(jest.fn() as never);
    const action = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(command => command.id == "farmbot:camera")
      ?.actions?.find(item => item.id == "calibrate");

    expect(action?.execute()).toEqual(false);
    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to calibrate the camera?");
    expect(calibrate).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    action?.execute();
    expect(calibrate).toHaveBeenCalledTimes(1);
    confirm.mockRestore();
    calibrate.mockRestore();
  });

  it("renders and runs toggle accessories", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const accessories = commands.filter(command => command.accessory);
    expect(accessories.map(command =>
      command.accessory?.(jest.fn(), command.toggleValue)))
      .not.toContain(undefined);
    const setting = commands.find(command =>
      command.id == "setting:dark_mode:toggle");
    const peripheral = commands.find(command =>
      command.id.startsWith("farmbot:peripheral:")
      && command.accessory);
    const runSetting = jest.fn();
    const runPeripheral = jest.fn();
    const { getAllByRole } = render(<>
      {setting?.accessory?.(runSetting, true)}
      {peripheral?.accessory?.(runPeripheral, false)}
    </>);
    getAllByRole("button").map(button => fireEvent.click(button));
    expect(runSetting).toHaveBeenCalled();
    expect(runPeripheral).toHaveBeenCalled();
  });

  it("groups time travel presets and popup access", () => {
    const dispatch = jest.fn();
    const command = buildCommands({
      state: fakeState(), dispatch, navigate: jest.fn(),
    }).find(item => item.id == "time-travel");

    expect(command?.actions?.map(action => action.name))
      .toEqual(["Now", "Noon", "Midnight", "Open"]);
    expect(command?.actions?.map(action => action.id))
      .toEqual(["now", "noon", "midnight", "open"]);
    command?.actions?.map(action => action.execute());
    expect(dispatch.mock.calls.map(call => call[0])).toEqual([
      { type: Actions.SET_3D_TIME, payload: undefined },
      { type: Actions.SET_3D_TIME, payload: "12:00" },
      { type: Actions.SET_3D_TIME, payload: "00:00" },
      { type: Actions.OPEN_POPUP, payload: "timeTravel" },
    ]);
  });

  it("logs out through the shared session action", () => {
    const execute = jest.fn();
    const logout = jest.spyOn(logoutActions, "logout")
      .mockReturnValue(execute as never);
    const command = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "logout");

    expect(command).toMatchObject({
      name: "Log out",
      aliases: expect.arrayContaining(["logout", "sign out"]),
      icon: "sign-out",
    });
    expect(logout).toHaveBeenCalledWith();
    command?.execute();
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("deletes all logs after confirmation", async () => {
    Object.defineProperty(window.location, "assign", {
      configurable: true,
      value: jest.fn(),
    });
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
    const destroyAll = jest.spyOn(crud, "destroyAll")
      .mockResolvedValue({} as never);
    const command = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "logs:delete-all");

    await command?.execute();

    expect(confirm).toHaveBeenCalledWith(Content.DELETE_ALL_LOGS_CONFIRMATION);
    expect(destroyAll).toHaveBeenCalledWith("Log", true);
    expect(window.location.assign).toHaveBeenCalledWith(window.location.origin);
  });

  it("keeps all logs when deletion is cancelled", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const destroyAll = jest.spyOn(crud, "destroyAll");
    const command = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "logs:delete-all");

    expect(command?.execute()).toEqual(false);
    expect(confirm).toHaveBeenCalledWith(Content.DELETE_ALL_LOGS_CONFIRMATION);
    expect(destroyAll).not.toHaveBeenCalled();
  });

  it("keeps emergency unlock cancelled actions out of execution", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const emergencyUnlock = jest.spyOn(deviceActions, "emergencyUnlock")
      .mockImplementation(jest.fn() as never);
    const command = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "farmbot:unlock");

    expect(command?.execute()).toEqual(false);
    expect(emergencyUnlock).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    command?.execute();
    expect(emergencyUnlock).toHaveBeenCalledWith(true);
  });

  it("confirms disruptive device commands before execution", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const reboot = jest.spyOn(deviceActions, "reboot")
      .mockImplementation(jest.fn() as never);
    const powerOff = jest.spyOn(deviceActions, "powerOff")
      .mockImplementation(jest.fn() as never);
    const restartFirmware = jest.spyOn(deviceActions, "restartFirmware")
      .mockImplementation(jest.fn() as never);
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const cases: [string, string, jest.SpyInstance][] = [
      [
        "reboot",
        "Are you sure you want to reboot FarmBot?",
        reboot,
      ],
      [
        "restart-firmware",
        "Are you sure you want to restart the firmware?",
        restartFirmware,
      ],
      [
        "shutdown",
        "Are you sure you want to shut down FarmBot?",
        powerOff,
      ],
    ];
    const power = commands.find(item => item.id == "farmbot:power");

    cases.map(([id, message, execute], index) => {
      expect(power?.actions?.find(action => action.id == id)?.execute())
        .toEqual(false);
      expect(confirm).toHaveBeenNthCalledWith(index + 1, message);
      expect(execute).not.toHaveBeenCalled();
    });

    confirm.mockReturnValue(true);
    cases.map(([id, message, execute], index) => {
      power?.actions?.find(action => action.id == id)?.execute();
      expect(confirm).toHaveBeenNthCalledWith(index + cases.length + 1,
        message);
      expect(execute).toHaveBeenCalledTimes(1);
    });
  });

  it("confirms firmware flashing before execution", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const flashFirmware = jest.spyOn(deviceActions, "flashFirmware")
      .mockImplementation(jest.fn() as never);
    const navigate = jest.fn();
    const command = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate,
    }).find(item => item.id == "settings-item:flash-firmware");
    const action = command?.actions?.find(item => item.id == "flash");

    expect(action?.execute()).toEqual(false);
    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to flash the firmware?");
    expect(flashFirmware).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    action?.execute();
    expect(flashFirmware).toHaveBeenCalledWith("arduino");
  });

  it("groups find and move home axes into actions", () => {
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const findHome = commands.find(command =>
      command.id == "farmbot:find-home");
    expect(findHome).toMatchObject({
      name: "Find Home",
      icon: "home",
    });
    expect(findHome?.iconStack).toBeUndefined();
    expect(findHome?.actions?.map(action => action.name))
      .toEqual(["All", "X", "Y", "Z"]);
    expect(findHome?.actions?.map(action => action.id))
      .toEqual(["all", "x", "y", "z"]);
    const homeResults = searchCommands(commands, "home")
      .map(command => command.id);
    expect(homeResults.slice(0, 3)).toEqual([
      "farmbot:move-home",
      "farmbot:find-home",
      "farmbot:set-home",
    ]);
    expect(homeResults).not.toContain("farmbot:find-length");
    const moveHome = commands.find(command =>
      command.id == "farmbot:move-home");
    expect(moveHome).toMatchObject({
      name: "Move Home",
      icon: "home",
    });
    expect(moveHome?.iconStack).toBeUndefined();
    expect(moveHome?.actions?.map(action => action.name))
      .toEqual(["All", "X", "Y", "Z"]);
    expect(moveHome?.actions?.map(action => action.id))
      .toEqual(["all", "x", "y", "z"]);
  });

  it("groups find length and set home axes into actions", () => {
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const setHomeAction = jest.spyOn(deviceActions, "setHome")
      .mockImplementation(jest.fn() as never);
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const findLength = commands.find(command =>
      command.id == "farmbot:find-length");
    expect(findLength).toMatchObject({
      name: "Find Axis Length",
      icon: "search",
    });
    expect(findLength?.actions?.map(action => action.name))
      .toEqual(["All", "X", "Y", "Z"]);
    expect(findLength?.actions?.map(action => action.id))
      .toEqual(["all", "x", "y", "z"]);
    const setHome = commands.find(command =>
      command.id == "farmbot:set-home");
    expect(setHome).toMatchObject({ name: "Set Home", icon: "home" });
    expect(setHome?.actions?.map(action => action.name))
      .toEqual(["X", "Y", "Z"]);
    expect(setHome?.actions?.map(action => action.id))
      .toEqual(["x", "y", "z"]);
    expect(setHome?.actions?.[0].execute()).toEqual(false);
    expect(confirm).toHaveBeenCalledWith(
      "Are you sure you want to set the home position?");
    expect(setHomeAction).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    setHome?.actions?.[1].execute();
    expect(setHomeAction).toHaveBeenCalledWith("y");
  });

  it("uses device action icons", () => {
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const icon = (id: string) => commands.find(command =>
      command.id == `farmbot:${id}`)?.icon;

    expect(icon("sync")).toEqual("refresh");
    expect(icon("power")).toEqual("power-off");
  });

  it("groups sequence actions under one command", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    }).filter(command => command.id.startsWith("sequence:"));
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toEqual("fake");
    expect(commands[0].actions?.map(action => action.name))
      .toEqual(["Run", "Open", "Preview", "Copy", "Schedule"]);
    expect(commands[0].actions?.map(action => action.id))
      .toEqual(["run", "open", "preview", "copy", "schedule"]);
  });

  it("groups regimen actions under one command", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    }).filter(command => command.id.startsWith("regimen:"));
    expect(commands).toHaveLength(1);
    expect(commands[0].name).toEqual("Foo");
    expect(commands[0].actions?.map(action => action.name))
      .toEqual(["Open", "Copy", "Schedule"]);
    expect(commands[0].actions?.map(action => action.id))
      .toEqual(["open", "copy", "schedule"]);
  });

  it("groups garden creation actions under one command", () => {
    const snapshotGarden = jest.spyOn(savedGardenActions, "snapshotGarden")
      .mockReturnValue("snapshot-action" as never);
    const newSavedGarden = jest.spyOn(savedGardenActions, "newSavedGarden")
      .mockReturnValue("new-garden-action" as never);
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const command = buildCommands({
      state: fakeState(), dispatch, navigate,
    }).find(item => item.id == "garden");

    expect(command).toMatchObject({
      name: "Garden",
      imageIcon: TAB_ICON[Panel.SavedGardens],
    });
    expect(command?.actions?.map(action => action.name))
      .toEqual(["Snapshot current", "Create new"]);
    command?.actions?.[0].execute();
    command?.actions?.[1].execute();
    expect(snapshotGarden).toHaveBeenCalledWith(navigate);
    expect(newSavedGarden).toHaveBeenCalledWith(navigate, "", "");
    expect(dispatch).toHaveBeenCalledWith("new-garden-action");
  });

  it("disables scheduling for unsaved executables", () => {
    const state = stateWithResources();
    const sequence = selectAllSequences(state.resources.index)[0];
    sequence.body.id = undefined;
    const navigate = jest.fn();
    const command = buildCommands({ state, dispatch: jest.fn(), navigate })
      .find(item => item.id == `sequence:${sequence.uuid}`);
    const schedule = command?.actions?.find(action => action.id == "schedule");

    expect(schedule?.unavailable).toEqual("Save before scheduling.");
    schedule?.execute();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("groups signed distances under one move command per axis", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    }).filter(command => /^farmbot:move:[xyz]$/.test(command.id));
    expect(commands.map(command => command.name))
      .toEqual(["Move X", "Move Y", "Move Z"]);
    commands.map((command, index) => {
      expect(command.actions?.map(action => action.name)).toEqual([
        "Custom distance", "-1000", "-100", "-10", "-1", "+1", "+10",
        "+100", "+1000",
      ]);
      expect(command.actions?.[0].input?.fields).toEqual([{
        key: `${["x", "y", "z"][index]}Distance`,
        label: "Custom distance",
        type: "number",
      }]);
    });
  });

  it("builds type-specific curve creation commands", async () => {
    const state = fakeState();
    const savedCurve = fakeCurve();
    savedCurve.uuid = "Curve.water.1";
    savedCurve.body.id = 42;
    savedCurve.body.type = "water";
    savedCurve.body.name = "Water curve 1";
    state.resources = buildResourceIndex([savedCurve]);
    const init = jest.spyOn(crud, "init").mockImplementation(() => ({
      type: Actions.INIT_RESOURCE,
      payload: savedCurve,
    }));
    const save = jest.spyOn(crud, "save")
      .mockImplementation(() => (() => Promise.resolve()) as never);
    const dispatch = jest.fn();
    dispatch.mockImplementation((action: Function) =>
      typeof action == "function" ? action(dispatch, () => state) : action);
    const navigate = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate });
    const curveCommands = commands.find(command =>
      command.id == "panel:curves");
    const addActions = curveCommands?.actions?.slice(0, 3) || [];
    expect(addActions.map(action => action.name)).toEqual([
      "Add Water", "Add Spread", "Add Height",
    ]);
    await addActions[0].execute();
    await addActions[1].execute();
    await addActions[2].execute();
    expect(init).toHaveBeenCalledWith("Curve", {
      name: "Water curve 2",
      type: "water",
      data: { 1: 1, 30: 500, 45: 500, 60: 250 },
    });
    expect(init).toHaveBeenNthCalledWith(1, "Curve",
      expect.objectContaining({ type: "water" }));
    expect(init).toHaveBeenNthCalledWith(2, "Curve",
      expect.objectContaining({ type: "spread" }));
    expect(init).toHaveBeenNthCalledWith(3, "Curve",
      expect.objectContaining({ type: "height" }));
    expect(save).toHaveBeenCalledWith(savedCurve.uuid);
    expect(navigate).toHaveBeenCalledWith(Path.curves(42));
    init.mockRestore();
    save.mockRestore();
  });

  it("keeps curve creation failures on the current route", async () => {
    const state = fakeState();
    const curve = fakeCurve();
    const init = jest.spyOn(crud, "init").mockImplementation(() => ({
      type: Actions.INIT_RESOURCE,
      payload: curve,
    }));
    const save = jest.spyOn(crud, "save")
      .mockImplementation(() => (() => Promise.reject()) as never);
    const dispatch = jest.fn();
    dispatch.mockImplementation((action: Function) =>
      typeof action == "function" ? action(dispatch, () => state) : action);
    const navigate = jest.fn();
    const command = buildCommands({ state, dispatch, navigate })
      .find(item => item.id == "panel:curves");
    await command?.actions?.find(action => action.id == "add-water")
      ?.execute();
    expect(init).toHaveBeenCalled();
    expect(save).toHaveBeenCalledWith(curve.uuid);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("uses Settings panel titles for encoder firmware settings", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const encoderInvert = commands.find(command =>
      command.id == "firmware-setting:encoder_invert:set");
    expect(encoderInvert?.name).toEqual(DeviceSetting.invertEncoders);
    expect(searchCommands(commands, "Set firmware setting Invert Encoders")
      .map(command => command.id)).toContain(encoderInvert?.id);
    expect(commands.filter(command =>
      command.id.startsWith("firmware-setting:encoder_invert")))
      .toHaveLength(1);
  });

  it("renders boolean firmware settings as toggles", () => {
    const update = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const singleBooleanKeys = [
      "movement_secondary_motor_x", "param_e_stop_on_mov_err",
    ];
    singleBooleanKeys.map(key => {
      const command = commands.find(item =>
        item.id == `firmware-setting:${key}:toggle`);
      expect(command?.actions).toBeUndefined();
      expect(command?.accessory).toEqual(expect.any(Function));
    });
    const axisBoolean = commands.find(command =>
      command.id == "firmware-setting:encoder_invert:set");
    expect(axisBoolean?.actionTable).toEqual(true);
    expect(axisBoolean?.actions?.map(action => action.input?.fields[0]))
      .toEqual([
        { key: "x", label: "X", type: "boolean", initialValue: "0" },
        { key: "y", label: "Y", type: "boolean", initialValue: "0" },
        { key: "z", label: "Z", type: "boolean", initialValue: "0" },
      ]);
    expect(axisBoolean?.accessory).toBeUndefined();
    const numeric = commands.find(command =>
      command.id == "firmware-setting:encoder_missed_steps_max:set");
    expect(numeric?.actions?.map(action => action.input?.fields[0]))
      .toEqual([
        {
          key: "x", label: "X", type: "number", initialValue: "5",
          min: 0, max: 32000,
        },
        {
          key: "y", label: "Y", type: "number", initialValue: "5",
          min: 0, max: 32000,
        },
        {
          key: "z", label: "Z", type: "number", initialValue: "5",
          min: 0, max: 32000,
        },
      ]);
    expect(numeric?.accessory).toBeUndefined();
    const invert = commands.find(command =>
      command.id == "firmware-setting:movement_secondary_motor_x:toggle");
    expect(invert?.name).toEqual(DeviceSetting.enable2ndXMotor);
    expect(searchCommands(commands,
      `Set firmware setting ${DeviceSetting.enable2ndXMotor}`))
      .toContain(invert);
    invert?.execute();
    expect(update).toHaveBeenCalledWith("movement_secondary_motor_x", "0");
    update.mockRestore();
  });

  it("uses clear firmware setting titles", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const expectedNames = {
      param_mov_nr_retry: DeviceSetting.maxRetries,
      movement_step_per_mm: DeviceSetting.stepsPerMm,
      movement_home_spd: DeviceSetting.homingSpeed,
      movement_max_spd: DeviceSetting.maxSpeed,
      movement_min_spd: DeviceSetting.minimumSpeed,
      encoder_use_for_pos: DeviceSetting.useEncodersForPositioning,
    };

    Object.entries(expectedNames).map(([key, name]) =>
      expect(commands.find(command =>
        command.id == `firmware-setting:${key}:set`)?.name).toEqual(name));
    [
      "param_config_ok", "param_test", "param_use_eeprom", "param_version",
      "pin_report_1_pin_nr",
    ].map(key =>
      expect(commands.find(command =>
        command.id == `firmware-setting:${key}:set`)).toBeUndefined());
    expect(commands.find(command => command.id ==
      "firmware-setting:param_e_stop_on_mov_err:toggle")?.name)
      .toEqual(DeviceSetting.estopOnMovementError);
  });

  it("uses clear configuration setting titles", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });

    expect(commands.find(command =>
      command.id == "fbos-setting:sequence_init_log:toggle")?.name)
      .toEqual(DeviceSetting.enableSequenceBeginLogs);
    expect(commands.find(command => command.id ==
      "setting:enable_3d_electronics_box_top:toggle")?.name)
      .toEqual(DeviceSetting.enable3dElectronicsBox);
    expect(commands.find(command =>
      command.id == "setting:disable_i18n:toggle")?.name)
      .toEqual(DeviceSetting.internationalizeWebApp);
    [
      "setting:show_first_party_farmware:toggle",
      "setting:stub_config:toggle",
      "fbos-setting:arduino_debug_messages:toggle",
      "fbos-setting:disable_factory_reset:toggle",
      "fbos-setting:os_auto_update:toggle",
    ].map(id =>
      expect(commands.find(command => command.id == id)).toBeUndefined());
  });

  it("uses explicit setting titles, help, and exclusion catalogs", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const xySwap = commands.find(command =>
      command.id == "setting:xy_swap:toggle");
    expect(xySwap).toMatchObject({
      name: "Swap X and Y axis jog buttons",
      englishName: "Swap X and Y axis jog buttons",
      help: { text: Content.MAP_SWAP_XY },
    });
    expect(commands.find(command =>
      command.id == "settings-item:set-axis-length")?.help)
      .toMatchObject({ text: expect.any(String) });
    expect(commands.find(command => command.id == "farmbot:power")?.help)
      .toEqual({ text: Content.RESTART_FARMBOT, enableMarkdown: false });
    expect(commands.some(command =>
      command.englishName == "Config Ok")).toEqual(false);
    expect(commands.some(command =>
      command.id.includes("pin_report"))).toEqual(false);
    expect(commands.some(command =>
      command.id.includes("os_auto_update"))).toEqual(false);
  });

  it("validates every registered command input", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });

    const results = commands.flatMap(command => command.actions || [])
      .filter(action => action.input?.validate)
      .map(action => {
        const fields = action.input?.fields || [];
        return {
          valid: action.input?.validate?.(Object.fromEntries(
            fields.map(field => [
              field.key,
              field.initialValue ?? field.options?.[0]?.value ?? "0",
            ]),
          )),
          invalid: action.input?.validate?.(Object.fromEntries(
            fields.map(field => [field.key, "invalid"]),
          )),
        };
      });

    expect(results.length).toBeGreaterThan(0);
    results.map(result => {
      expect(result.valid).toBeUndefined();
    });
    expect(results.some(result => typeof result.invalid == "string")).toBe(true);
  });

  // eslint-disable-next-line complexity
  it("validates firmware inputs", () => {
    const state = stateWithResources();
    const commands = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    });
    const numeric = commands.find(command =>
      command.id == "firmware-setting:encoder_missed_steps_max:set")
      ?.actions?.find(action => action.id == "x");
    expect(numeric?.input?.validate?.({ x: "32000" })).toBeUndefined();
    ["32001", "1.5", "invalid"].map(value =>
      expect(numeric?.input?.validate?.({ x: value }))
        .toEqual(expect.any(String)));
    expect(numeric?.execute({ x: "32001" })).toEqual(false);
  });

  it("falls back to live bot state when config resources are absent", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice()]);
    state.bot.hardware.configuration.sequence_init_log = true;
    state.bot.hardware.mcu_params.encoder_missed_steps_max_x = 17;
    const commands = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    });

    expect(commands.find(command =>
      command.id == "fbos-setting:sequence_init_log:toggle")?.toggleValue)
      .toEqual(true);
    expect(commands.find(command =>
      command.id == "firmware-setting:encoder_missed_steps_max:set")
      ?.actions?.find(action => action.id == "x")
      ?.input?.fields[0].initialValue).toEqual("17");
  });

  it("does not recreate or delete a scene that is already selected", () => {
    const state = stateWithResources();
    const set3DConfigValue = jest.fn();
    jest.spyOn(threeDSettings, "get3DConfigValueFunction")
      .mockReturnValue(() => 1);
    jest.spyOn(threeDSettings, "findOrCreate3DConfigFunction")
      .mockReturnValue(set3DConfigValue);
    const destroy = jest.spyOn(crud, "destroy");
    const confirm = jest.spyOn(window, "confirm");
    const scene = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    }).find(command => command.id == "setting:3d:scene:set");

    expect(scene?.actions?.[0].input?.fields[0].initialValue).toEqual("1");
    expect(scene?.execute({ value: "1" })).toEqual(false);
    expect(confirm).not.toHaveBeenCalled();
    expect(destroy).not.toHaveBeenCalled();
    expect(set3DConfigValue).not.toHaveBeenCalled();
  });

  it("validates and confirms 3D setting changes", () => {
    const state = stateWithResources();
    const set3DConfigValue = jest.fn();
    jest.spyOn(threeDSettings, "get3DConfigValueFunction")
      .mockReturnValue(() => 1);
    jest.spyOn(threeDSettings, "findOrCreate3DConfigFunction")
      .mockReturnValue(set3DConfigValue);
    const destroy = jest.spyOn(crud, "destroy")
      .mockReturnValue("destroy-action" as never);
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const dispatch = jest.fn();
    const commands = buildCommands({
      state, dispatch, navigate: jest.fn(),
    });
    const heading = commands.find(command =>
      command.id == "setting:3d:heading:set");
    const texture = commands.find(command =>
      command.id == "setting:3d:groundTexture:set");
    const scene = commands.find(command =>
      command.id == "setting:3d:scene:set");

    expect(heading?.execute({ value: "invalid" })).toEqual(false);
    expect(texture?.execute({ value: "invalid" })).toEqual(false);
    expect(scene?.execute({ value: "2" })).toEqual(false);
    expect(destroy).not.toHaveBeenCalled();
    expect(set3DConfigValue).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    scene?.execute({ value: "2" });
    expect(destroy).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith("destroy-action");
    expect(set3DConfigValue).toHaveBeenCalledWith("groundTexture", "2");
    expect(set3DConfigValue).toHaveBeenCalledWith("scene", "2");
  });

  it("converts motor current percentages before updating firmware", () => {
    const state = fakeState();
    const fbos = fakeFbosConfig();
    fbos.body.firmware_hardware = "farmduino_k15";
    state.resources = buildResourceIndex([fbos, fakeFirmwareConfig()]);
    const update = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const command = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "firmware-setting:movement_motor_current:set");

    command?.actions?.find(action => action.id == "x")
      ?.execute({ x: "1" });
    expect(update).toHaveBeenCalledWith(
      "movement_motor_current_x", expect.any(String));
  });

  it("ranks settings below map layer settings", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const setting = commands.find(command =>
      command.id == "setting:dark_mode:toggle");
    const mapLayer = commands.find(command =>
      command.id == "setting:show_plants:toggle");
    const advancedSetting = commands.find(command =>
      command.id == "setting:show_advanced_settings:toggle");
    const mapLayers = commands.filter(command =>
      command.group == "map" && command.id.startsWith("setting:"));
    expect(commands.filter(command => command.group == "settings")
      .every(command => command.priority == -1)).toEqual(true);
    expect(mapLayer).toMatchObject({
      name: "Plants Map Layer",
      englishName: "Plants Map Layer",
      group: "map",
      imageIcon: TAB_ICON[Panel.Map],
      themeAwareImageIcon: true,
    });
    expect(mapLayers).toHaveLength(11);
    expect(mapLayers.every(command =>
      !command.name.startsWith("Show ")
      && !command.englishName.startsWith("Show ")
      && command.imageIcon == TAB_ICON[Panel.Map])).toEqual(true);
    expect(mapLayer?.priority).toBeUndefined();
    expect(commands.find(command =>
      command.id == "setting:three_d_garden:toggle")).toBeUndefined();
    expect(commands.find(command =>
      command.id == "setting:show_zones:toggle")).toBeUndefined();
    expect(advancedSetting).toMatchObject({
      group: "settings", priority: -1,
    });
    expect(searchCommands([setting!, mapLayer!], "enable"))
      .toEqual([mapLayer, setting]);
  });

  it("requires confirmation before weakening safety settings", () => {
    const update = jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn() as never);
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const dispatch = jest.fn();
    const commands = buildCommands({
      state: stateWithResources(), dispatch, navigate: jest.fn(),
    });
    const settings = [
      BooleanSetting.discard_unsaved,
      BooleanSetting.discard_unsaved_sequences,
      BooleanSetting.disable_emergency_unlock_confirmation,
    ];
    settings.map(setting =>
      expect(commands.find(command =>
        command.id == `setting:${setting}:toggle`)?.execute()).toEqual(false));
    expect(confirm).toHaveBeenCalledTimes(settings.length);
    expect(update).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    settings.map(setting => commands.find(command =>
      command.id == `setting:${setting}:toggle`)?.execute());
    expect(update.mock.calls.map(call => call.slice(0, 2))).toEqual(
      settings.map(setting => [setting, true]));
    expect(dispatch).toHaveBeenCalledTimes(settings.length);
  });

  it("lists sections by name and supports every visibility verb", () => {
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const plants = commands.filter(command => command.id == "panel:plants");
    expect(plants).toHaveLength(1);
    expect(plants[0].name).toEqual("Plants");
    ["Open", "Close", "Toggle", "Navigate to", "Go to"].map(verb =>
      expect(searchCommands(commands, `${verb} Plants`)
        .map(command => command.id)).toContain("panel:plants"));
  });

  // eslint-disable-next-line complexity
  it("closes the current panel and always opens requested panels", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.panelOpen = true;
    const setPanel = jest.fn();
    const dispatch = jest.fn((action: Function) => action(setPanel));
    const commands = buildCommands({ state, dispatch, navigate: jest.fn() });
    const panel = commands.find(command => command.id == "panel");
    expect(panel?.name).toEqual("Close Panel");
    expect(panel?.icon).toEqual("step-backward");
    panel?.execute();
    expect(setPanel.mock.calls.map(call => call[0].payload))
      .toEqual([false]);
    state.resources.consumers.farm_designer.panelOpen = false;
    const closedPanel = buildCommands({ state, dispatch, navigate: jest.fn() })
      .find(command => command.id == "panel");
    expect(closedPanel?.name).toEqual("Close Panel");
    expect(closedPanel?.aliases).not.toContain("Open Panel");
    expect(closedPanel?.aliases).not.toContain("Toggle Panel");
    closedPanel?.execute();
    expect(setPanel.mock.calls.map(call => call[0].payload))
      .toEqual([false, false]);

    const navigate = jest.fn();
    buildCommands({ state, dispatch, navigate })
      .find(command => command.id == "panel:plants")
      ?.actions?.find(action => action.id == "open-panel")?.execute();
    expect(setPanel.mock.calls.map(call => call[0].payload))
      .toEqual([false, false, true]);
    expect(navigate).toHaveBeenCalledWith(Path.plants());

    location.pathname = Path.plants();
    state.resources.consumers.farm_designer.panelOpen = true;
    const activePanel = buildCommands({ state, dispatch, navigate })
      .find(command => command.id == "panel:plants");
    activePanel?.actions?.find(action => action.id == "open-panel")?.execute();
    expect(setPanel.mock.calls.map(call => call[0].payload))
      .toEqual([false, false, true, true]);
    expect(navigate).toHaveBeenCalledWith(Path.plants());
    buildCommands({ state, dispatch, navigate })
      .find(command => command.id == "panel:map")?.execute();
    buildCommands({ state, dispatch, navigate })
      .find(command => command.id == "panel:settings")?.execute();
    expect(setPanel.mock.calls.map(call => call[0].payload))
      .toEqual([false, false, true, true, false, true]);
    expect(navigate).toHaveBeenCalledTimes(4);
  });

  // eslint-disable-next-line complexity
  it("toggles popups and nested app sections", () => {
    const state = fakeState();
    state.app.popups.controls = true;
    state.app.controls.peripherals = true;
    state.app.popups.connectivity = true;
    state.app.metricPanelState.history = true;
    const dispatch = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate: jest.fn() });
    commands.find(command => command.id == "popup:jobs")?.execute();
    commands.find(command => command.id == "popup:controls")
      ?.actions?.find(action => action.id == "open-panel")?.execute();
    commands.find(command => command.id == "popup:controls")
      ?.actions?.find(action => action.id == "peripherals")?.execute();
    commands.find(command => command.id == "panel:plants")
      ?.actions?.find(action => action.id == "groups")?.execute();
    commands.find(command => command.id == "popup:connectivity")
      ?.actions?.find(action => action.id == "open-panel")?.execute();
    commands.find(command => command.id == "popup:connectivity")
      ?.actions?.find(action => action.id == "history")?.execute();
    commands.find(command => command.id == "settings-section:axis_settings")
      ?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "jobs",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "controls",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_PLANTS_PANEL_OPTION, payload: "groups",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_POPUP, payload: "connectivity",
    });
    state.app.popups.connectivity = false;
    state.app.metricPanelState.network = false;
    buildCommands({ state, dispatch, navigate: jest.fn() })
      .find(command => command.id == "popup:connectivity")
      ?.actions?.find(action => action.id == "network")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP, payload: "connectivity",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_METRIC_PANEL_OPTION, payload: "network",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION, payload: "axis_settings",
    });
  });

  it("provides section view controls", () => {
    const state = fakeState();
    const dispatch = jest.fn();
    const command = buildCommands({
      state, dispatch, navigate: jest.fn(),
    }).find(item => item.id == "section-view");

    expect(command).toMatchObject({
      name: "Section View",
      aliases: expect.arrayContaining(["Profile view"]),
      icon: "scissors",
      actions: [
        { id: "toggle", name: "Toggle On/Off" },
        { id: "axis", name: "Switch Axis" },
        { id: "follow-bot", name: "Follow Bot" },
        { id: "clip-all", name: "Clip All" },
      ],
    });
    command?.actions?.map(action => action.execute());
    expect(dispatch.mock.calls.map(call => call[0])).toEqual([
      { type: Actions.SET_3D_SECTION_OPEN, payload: true },
      { type: Actions.SET_3D_SECTION_AXIS, payload: "y" },
      { type: Actions.SET_3D_SECTION_FOLLOW_BOT, payload: false },
      { type: Actions.SET_3D_SECTION_CLIP_ALL, payload: false },
    ]);
  });

  it("selects resources and manages the selection panel", () => {
    const state = stateWithResources();
    const setPanel = jest.fn();
    const dispatch = jest.fn((action: Function) =>
      typeof action == "function" ? action(setPanel) : action);
    const navigate = jest.fn();
    location.pathname = Path.designer();
    const command = buildCommands({ state, dispatch, navigate })
      .find(item => item.id == "select");

    expect(command).toMatchObject({
      name: "Select",
      icon: "mouse-pointer",
      actions: [
        { id: "all-plants", name: "All Plants" },
        { id: "all-weeds", name: "All Weeds" },
        { id: "all-points", name: "All Points" },
        { id: "custom", name: "Custom" },
        { id: "none", name: "None" },
      ],
    });
    const index = state.resources.index;
    const cases = [
      ["all-plants", "Plant",
        selectAllPlantPointers(index).map(point => point.uuid)],
      ["all-weeds", "Weed",
        selectAllWeedPointers(index).map(point => point.uuid)],
      ["all-points", "GenericPointer",
        selectAllGenericPointers(index).map(point => point.uuid)],
    ] as const;
    cases.map(([id, pointerType, uuids]) => {
      dispatch.mockClear();
      setPanel.mockClear();
      navigate.mockClear();
      command?.actions?.find(action => action.id == id)?.execute();
      expect(dispatch).toHaveBeenCalledWith({
        type: Actions.SET_SELECTION_POINT_TYPE,
        payload: [pointerType],
      });
      expect(dispatch).toHaveBeenCalledWith({
        type: Actions.SELECT_POINT,
        payload: uuids,
      });
      expect(setPanel).toHaveBeenCalledWith({
        type: Actions.SET_PANEL_OPEN,
        payload: true,
      });
      expect(navigate).toHaveBeenCalledWith(Path.plants("select"));
    });

    dispatch.mockClear();
    setPanel.mockClear();
    navigate.mockClear();
    command?.actions?.find(action => action.id == "custom")?.execute();
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(setPanel).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
    expect(navigate).toHaveBeenCalledWith(Path.plants("select"));

    dispatch.mockClear();
    setPanel.mockClear();
    navigate.mockClear();
    state.resources.consumers.farm_designer.panelOpen = true;
    location.pathname = Path.plants("select");
    command?.actions?.find(action => action.id == "none")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined,
    });
    expect(setPanel).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: false,
    });
    expect(navigate).toHaveBeenCalledWith(Path.designer());

    dispatch.mockClear();
    setPanel.mockClear();
    navigate.mockClear();
    state.resources.consumers.farm_designer.panelOpen = false;
    location.pathname = Path.designer();
    command?.actions?.find(action => action.id == "none")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_POINT,
      payload: undefined,
    });
    expect(setPanel).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("navigates to top-level Photos subsections", () => {
    const state = fakeState();
    const setPanel = jest.fn();
    const dispatch = jest.fn((action: Function) =>
      typeof action == "function" ? action(setPanel) : action);
    const navigate = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate });
    const sections = [
      ["filter", "Filters"],
      ["camera", "Settings"],
      ["calibration", "Calibration"],
      ["detection", "Weed detection"],
      ["measure", "Measure soil height"],
    ];
    const photoCommand = commands.find(command =>
      command.id == "panel:photos");
    const photoActions = photoCommand?.actions?.slice(1) || [];
    expect(photoActions.map(action => action.id))
      .toEqual(sections.map(([section]) => section));
    expect(photoActions.map(action => action.name))
      .toEqual(sections.map(([, title]) => title));
    photoActions.map(action => action.execute());
    const directActions = dispatch.mock.calls
      .map(call => call[0])
      .filter(action => typeof action != "function");
    expect(directActions).toEqual(sections.flatMap(([section]) => [
      { type: Actions.BULK_TOGGLE_PHOTOS_PANEL, payload: false },
      { type: Actions.TOGGLE_PHOTOS_PANEL_OPTION, payload: section },
    ]));
    expect(navigate.mock.calls.map(call => call[0]))
      .toEqual(sections.map(() => Path.photos()));
    expect(setPanel).toHaveBeenCalledTimes(sections.length);
    expect(photoCommand?.actions?.map(action => action.name))
      .not.toContain("Manage Data");
  });

  it("opens deep controls and requests camera views", () => {
    const state = fakeState();
    const dispatch = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate: jest.fn() });
    commands.find(command => command.id == "popup:controls")
      ?.actions?.find(action => action.id == "peripherals")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.OPEN_POPUP,
      payload: "controls",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CONTROLS_PANEL_OPTION,
      payload: "peripherals",
    });
    const cameraView = commands.find(command => command.id == "camera:view");
    expect(cameraView).toMatchObject({ name: "3D Camera View", icon: "cube" });
    const orbit = commands.find(command =>
      command.id == "camera:orbit:top");
    expect(orbit?.icon).toEqual("cube");
    orbit?.actions?.find(action => action.name == "Top")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW,
      payload: { direction: [0, 0, 1], nonce: expect.any(Number) },
    });
  });

  it("navigates to highlighted settings subsections", () => {
    const navigate = jest.fn();
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate,
    });
    const highlights = {
      farmbot_settings: "farmbot",
      power_and_reset: "power_and_reset",
      axis_settings: "axes",
      motors: "motors",
      encoders_or_stall_detection: "encoders",
      limit_switches: "limit_switches",
      error_handling: "error_handling",
      pin_bindings: "pin_bindings",
      pin_guard: "pin_guard",
      parameter_management: "parameter_management",
      custom_settings: "custom_settings",
      farm_designer: "farm_designer",
      three_d: "3d_garden",
      account: "account",
      other_settings: "other",
    };

    Object.keys(highlights).map(key => commands.find(command =>
      command.id == `settings-section:${key}`)?.execute());

    expect(navigate.mock.calls.map(call => call[0])).toEqual(
      Object.values(highlights).map(highlight => Path.settings(highlight)));
  });

  it("navigates to the setup wizard", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const command = buildCommands({ state: fakeState(), dispatch, navigate })
      .find(item => item.id == "setup-wizard");

    expect(command).toMatchObject({
      name: "Setup",
      aliases: expect.arrayContaining(["setup wizard", "Open Setup"]),
      icon: "magic",
    });
    command?.execute();
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
    expect(navigate).toHaveBeenCalledWith(Path.setup());
  });

  it("navigates to Documentation destinations", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const commands = buildCommands({ state: fakeState(), dispatch, navigate });
    commands.find(command => command.id == "documentation")
      ?.actions?.find(action => action.id == "genesis")?.execute();
    expect(navigate).toHaveBeenCalledWith(Path.designer("genesis"));
    expect(dispatch).toHaveBeenCalled();
  });

  it("opens FarmBot shop and follow links in new tabs", () => {
    const open = jest.spyOn(window, "open").mockReturnValue({} as Window);
    const assign = jest.spyOn(window.location, "assign")
      .mockImplementation(jest.fn());
    const commands = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const actions = [
      ...(commands.find(command => command.id == "shop")?.actions || []),
      ...(commands.find(command =>
        command.id == "follow-farmbot")?.actions || []),
    ];
    const urls = [
      ExternalUrl.Store.buyParts,
      ExternalUrl.Store.fullKits,
      ExternalUrl.Store.home,
      ExternalUrl.Store.blog,
      ...Object.values(ExternalUrl.Follow),
      ExternalUrl.Store.blog,
    ];
    expect(actions.map(action => action.href)).toEqual(urls);
    actions.find(action => action.id == "newsletter")?.execute();
    expect(open).toHaveBeenCalledWith(
      ExternalUrl.Follow.newsletter, "_blank");

    open.mockReturnValueOnce(undefined as unknown as Window);
    actions.find(action => action.id == "buy-parts")?.execute();
    expect(assign).toHaveBeenCalledWith(ExternalUrl.Store.buyParts);

    assign.mockRestore();
    open.mockRestore();
  });

  it("opens crop details for built-in and API crops", () => {
    const navigate = jest.fn();
    const setPanel = jest.fn();
    const dispatch = jest.fn((action: Function) => action(setPanel));
    const commands = buildCommands({
      state: stateWithResources(), dispatch, navigate,
    });
    expect(commands.find(command =>
      command.id == "add:crop:api-only-crop")?.name)
      .toEqual("Api Only Crop");
    commands.find(command => command.id == "add:crop:carrot")?.execute();
    commands.find(command => command.id == "add:crop:api-only-crop")
      ?.execute();
    commands.find(command => command.id == "panel:plants")
      ?.actions?.find(action => action.id == "add-new")?.execute();
    expect(navigate.mock.calls).toEqual([
      [Path.cropSearch("carrot")],
      [Path.cropSearch("api-only-crop")],
      [Path.cropSearch()],
    ]);
    expect(setPanel.mock.calls.map(call => call[0])).toEqual([
      { type: Actions.SET_PANEL_OPEN, payload: true },
      { type: Actions.SET_PANEL_OPEN, payload: true },
      { type: Actions.SET_PANEL_OPEN, payload: true },
    ]);
  });

  // eslint-disable-next-line complexity
  it("adds crop and point grids or resources from inline actions", () => {
    const state = stateWithResources();
    const config = getWebAppConfig(state.resources.index);
    if (!config) { throw new Error("Web app config not found."); }
    config.body.three_d_garden = true;
    state.bot.hardware.location_data.position = {
      x: 123.4,
      y: 456.6,
      z: 12,
    };
    state.resources.consumers.farm_designer.drawnPoint = {
      name: "Palette Point",
      cx: undefined,
      cy: undefined,
      z: 7,
      r: 40,
      color: "blue",
      at_soil_level: true,
    };
    const initSave = jest.spyOn(crud, "initSave")
      .mockReturnValue({ type: Actions.INIT_RESOURCE } as never);
    const dispatch = jest.fn();
    dispatch.mockImplementation((action: unknown): unknown =>
      typeof action == "function"
        ? (action as (
          dispatch: Function,
          getState: () => typeof state,
        ) => unknown)(dispatch, () => state)
        : action);
    const navigate = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate });
    const crop = commands.find(command =>
      command.id == "add:crop:carrot");
    const point = commands.find(command => command.id == "panel:points");

    crop?.actions?.find(action => action.id == "add-grid")?.execute();
    crop?.actions?.find(action => action.id == "add-current")?.execute();
    point?.actions?.find(action => action.id == "add-new")?.execute();
    point?.actions?.find(action => action.id == "add-grid")?.execute();

    const gridRequests = dispatch.mock.calls
      .map((call: unknown[]) =>
        call[0] as { type?: string; payload?: object })
      .filter(action => action.type == Actions.SET_GRID_PLANTING);
    expect(gridRequests).toHaveLength(2);
    expect(gridRequests[0]?.payload).toEqual(expect.objectContaining({
      gridType: "plant",
      cropSlug: "carrot",
      itemName: "Carrot",
    }));
    expect(gridRequests[1]?.payload).toEqual(expect.objectContaining({
      gridType: "point",
      itemName: "Palette Point",
      defaultSpacing: 100,
      radius: 0,
      z: 7,
      meta: {
        color: "blue",
        at_soil_level: "true",
      },
    }));
    expect(initSave).toHaveBeenNthCalledWith(1, "Point",
      expect.objectContaining({
        x: 120,
        y: 460,
        openfarm_slug: "carrot",
      }));
    expect(initSave).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(Path.cropSearch("carrot"));
    expect(navigate).toHaveBeenCalledWith(Path.points("add"));
    initSave.mockRestore();
  });

  // eslint-disable-next-line complexity
  it("opens 2D grid editors and disables unknown current locations", () => {
    const state = stateWithResources();
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate });
    const crop = commands.find(command =>
      command.id == "add:crop:carrot");
    const point = commands.find(command => command.id == "panel:points");
    const cropCurrent = crop?.actions?.find(action =>
      action.id == "add-current");

    crop?.actions?.find(action => action.id == "add-grid")?.execute();
    point?.actions?.find(action => action.id == "add-grid")?.execute();
    cropCurrent?.execute();

    expect(cropCurrent?.unavailable).toEqual("FarmBot position unknown.");
    expect(point?.actions?.some(action => action.id == "add-current"))
      .toEqual(false);
    expect(navigate).toHaveBeenCalledWith(Path.cropSearch("carrot"));
    expect(navigate).toHaveBeenCalledWith(Path.points("add"));
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_LEGACY_GRID_PLANTING_CROP,
      payload: "carrot",
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_LEGACY_POINT_GRID,
      payload: true,
    });
    expect(dispatch).not.toHaveBeenCalledWith(expect.objectContaining({
      type: Actions.SET_GRID_PLANTING,
    }));
  });

  // eslint-disable-next-line complexity
  it("executes device command families with exact adapter inputs", () => {
    localStorage.setItem("myBotIs", "online");
    jest.spyOn(window, "confirm").mockReturnValue(true);
    const state = stateWithResources();
    state.bot.hardware.location_data.position.z = 321;
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const actionNames: (keyof typeof deviceActions)[] = [
      "emergencyLock", "emergencyUnlock", "execSequence", "findAxisLength",
      "findHome", "moveAbsolute", "moveRelative", "moveToHome", "pinToggle",
      "powerOff", "readPin", "reboot", "restartFirmware",
      "setHome", "takePhoto", "writePin",
    ];
    actionNames.map(name => jest.spyOn(deviceActions, name)
      .mockImplementation(jest.fn() as never));
    const photoActionNames: (keyof typeof photoActions)[] = [
      "calibrateCamera", "detectWeeds", "measureSoilHeight",
    ];
    photoActionNames.map(name => jest.spyOn(photoActions, name)
      .mockImplementation(jest.fn() as never));
    jest.spyOn(deviceActions, "sync")
      .mockReturnValue("sync-action" as never);
    const commands = buildCommands({ state, dispatch, navigate });
    const execute = (id: string, values?: Record<string, string>) =>
      commands.find(command => command.id == id)?.execute(values);

    const move = (
      axis: string,
      distance: string,
      values?: Record<string, string>,
    ) =>
      commands.find(command => command.id == `farmbot:move:${axis}`)
        ?.actions?.find(action => action.id == distance)?.execute(values);
    move("x", "custom", { xDistance: "42.5" });
    move("x", "+10");
    move("y", "-1000");
    move("z", "+100");
    execute("farmbot:move-to:coordinates", { x: "1", y: "2", z: "3" });
    const plant = selectAllPlantPointers(state.resources.index)[0];
    const plantCommand = commands.find(command =>
      command.id == `plant:${plant.uuid}`);
    plantCommand?.actions?.find(action => action.id == "go-xy")?.execute();
    plantCommand?.actions?.find(action => action.id == "go-xyz")?.execute();
    expect(deviceActions.moveRelative)
      .toHaveBeenNthCalledWith(1, { x: 42.5, y: 0, z: 0 });
    expect(deviceActions.moveRelative)
      .toHaveBeenNthCalledWith(2, { x: 10, y: 0, z: 0 });
    expect(deviceActions.moveRelative)
      .toHaveBeenNthCalledWith(3, { x: 0, y: -1000, z: 0 });
    expect(deviceActions.moveRelative)
      .toHaveBeenNthCalledWith(4, { x: 0, y: 0, z: 100 });
    expect(deviceActions.moveAbsolute)
      .toHaveBeenNthCalledWith(1, { x: 1, y: 2, z: 3 });
    expect(deviceActions.moveAbsolute).toHaveBeenNthCalledWith(2, {
      x: plant.body.x, y: plant.body.y, z: 321,
    });
    expect(deviceActions.moveAbsolute).toHaveBeenNthCalledWith(3, {
      x: plant.body.x, y: plant.body.y, z: plant.body.z,
    });

    const home = (id: string, axis: string) =>
      commands.find(command => command.id == `farmbot:${id}`)
        ?.actions?.find(action => action.id == axis)?.execute();
    home("move-home", "x");
    home("find-home", "y");
    home("set-home", "z");
    home("find-length", "all");
    expect(deviceActions.moveToHome).toHaveBeenCalledWith("x");
    expect(deviceActions.findHome).toHaveBeenCalledWith("y");
    expect(deviceActions.setHome).toHaveBeenCalledWith("z");
    expect(deviceActions.findAxisLength).toHaveBeenCalledWith("all");

    [
      "farmbot:estop", "farmbot:unlock", "farmbot:sync",
    ].map(id => execute(id));
    commands.find(command => command.id == "panel:tools")
      ?.actions?.find(action => action.id == "verify-tool")?.execute();
    commands.find(command => command.id == "farmbot:camera")
      ?.actions?.map(action => action.execute());
    commands.find(command => command.id == "farmbot:power")
      ?.actions?.map(action => action.execute());
    expect(deviceActions.emergencyLock).toHaveBeenCalledTimes(1);
    expect(deviceActions.emergencyUnlock).toHaveBeenCalledWith(true);
    expect(deviceActions.takePhoto).toHaveBeenCalledTimes(1);
    expect(photoActions.calibrateCamera).toHaveBeenCalledTimes(1);
    expect(photoActions.detectWeeds).toHaveBeenCalledTimes(1);
    expect(photoActions.measureSoilHeight).toHaveBeenCalledTimes(1);
    expect(deviceActions.readPin).toHaveBeenCalledWith(52, "pin52", 0);
    expect(deviceActions.reboot).toHaveBeenCalledTimes(1);
    expect(deviceActions.powerOff).toHaveBeenCalledTimes(1);
    expect(deviceActions.restartFirmware).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith("sync-action");

    const peripherals = selectAllPeripherals(state.resources.index);
    const digital = peripherals.find(item => item.body.mode == 0);
    const analog = peripherals.find(item => item.body.mode == 1);
    execute(`farmbot:peripheral:${digital?.uuid}`);
    execute(`farmbot:peripheral:${analog?.uuid}`, { value: "10" });
    expect(deviceActions.pinToggle).toHaveBeenCalledWith(digital?.body.pin);
    expect(deviceActions.writePin)
      .toHaveBeenCalledWith(analog?.body.pin, 10, 1);
    const digitalCommand = commands.find(command =>
      command.id == `farmbot:peripheral:${digital?.uuid}`);
    const analogCommand = commands.find(command =>
      command.id == `farmbot:peripheral:${analog?.uuid}`);
    expect(digitalCommand?.actions).toBeUndefined();
    expect(digitalCommand?.accessory).toEqual(expect.any(Function));
    expect(analogCommand?.actions).toHaveLength(1);
    expect(analogCommand?.name).toEqual(analog?.body.label);
    expect(analogCommand?.aliases).toEqual(expect.arrayContaining([
      "peripheral", `Peripheral ${analog?.body.label}`,
      `Set peripheral ${analog?.body.label}`,
    ]));

    const sequence = selectAllSequences(state.resources.index)[0];
    commands.find(command => command.id == `sequence:${sequence.uuid}`)
      ?.actions?.find(action => action.id == "run")?.execute();
    expect(deviceActions.execSequence).toHaveBeenCalledWith(sequence.body.id);
  });

  it("updates settings through their typed persistence actions", () => {
    const state = stateWithResources();
    const dispatch = jest.fn();
    const setWebAppConfigValue = jest.spyOn(
      configStorageActions, "setWebAppConfigValue")
      .mockImplementation((key, value) => ({ key, value }) as never);
    const updateConfig = jest.spyOn(deviceActions, "updateConfig")
      .mockImplementation(update => ({ update }) as never);
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation((key, value) => ({ key, value }) as never);
    const commands = buildCommands({ state, dispatch, navigate: jest.fn() });
    const execute = (id: string, values?: Record<string, string>) =>
      commands.find(command => command.id == id)?.execute(values);

    execute("setting:show_plants:toggle");
    execute("setting:success_log:set");
    execute("setting:beep_verbosity:set", { value: "2" });
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      BooleanSetting.show_plants, false);
    expect(setWebAppConfigValue).toHaveBeenCalledWith("success_log", 0);
    expect(setWebAppConfigValue).toHaveBeenCalledWith("beep_verbosity", 2);
    expect(commands.find(command =>
      command.id == "setting:go_button_axes:set")).toBeUndefined();
    const beepVerbosity = commands.find(command =>
      command.id == "setting:beep_verbosity:set");
    expect(beepVerbosity?.name)
      .toEqual(DeviceSetting.browserFarmbotActivityBeep);
    expect(firstInputOptions(beepVerbosity).map(option => option.value))
      .toEqual(["0", "1", "2", "3"]);
    expect(searchCommands(commands,
      `Set ${DeviceSetting.browserFarmbotActivityBeep}`))
      .toContain(beepVerbosity);

    execute("fbos-setting:default_axis_order:set", { value: "xyz;high" });
    execute("fbos-setting:update_channel:set", { value: "stable" });
    execute("fbos-setting:sequence_init_log:toggle");
    expect(commands.find(command =>
      command.id == "fbos-setting:os_auto_update:toggle")).toBeUndefined();
    const defaultAxisOrder = commands.find(command =>
      command.id == "fbos-setting:default_axis_order:set");
    expect(defaultAxisOrder?.name).toEqual(DeviceSetting.defaultAxisOrder);
    expect(firstInputOptions(defaultAxisOrder))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ value: "xyz;high" }),
      ]));
    expect(searchCommands(commands,
      `Set FarmBot setting ${DeviceSetting.defaultAxisOrder}`))
      .toContain(defaultAxisOrder);
    expect(updateConfig).toHaveBeenCalledWith({
      default_axis_order: "xyz;high",
    });
    expect(updateConfig).toHaveBeenCalledWith({ update_channel: "stable" });
    expect(updateConfig).toHaveBeenCalledWith({ sequence_init_log: false });
    const firmwareSetting = commands.find(command =>
      command.id == "firmware-setting:encoder_missed_steps_max:set");
    firmwareSetting?.actions?.[0].execute({ x: "12" });
    firmwareSetting?.actions?.[1].execute({ y: "13" });
    firmwareSetting?.actions?.[2].execute({ z: "14" });
    commands.find(command =>
      command.id == "firmware-setting:param_mov_nr_retry:set")
      ?.actions?.[0].execute({ value: "4" });
    expect(updateMCU.mock.calls).toEqual(expect.arrayContaining([
      ["encoder_missed_steps_max_x", "12"],
      ["encoder_missed_steps_max_y", "13"],
      ["encoder_missed_steps_max_z", "14"],
      ["param_mov_nr_retry", "4"],
    ]));

    commands.find(command => command.id == "camera:view")
      ?.actions?.find(action => action.id == "toggle-perspective")?.execute();
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_PERSPECTIVE, payload: false,
    });
  });

  it("opens settings items that are not direct actions", () => {
    const dispatch = jest.fn();
    const navigate = jest.fn();
    buildCommands({
      state: stateWithResources(), dispatch, navigate,
    }).find(command => command.id == "settings-item:set-axis-length")
      ?.execute();

    expect(dispatch).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it("rejects invalid setting values", () => {
    const state = stateWithResources();
    const setWebAppConfigValue = jest.spyOn(
      configStorageActions, "setWebAppConfigValue")
      .mockImplementation((key, value) => ({ key, value }) as never);
    const commands = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    });
    const execute = (id: string, value: string) =>
      commands.find(command => command.id == id)?.execute({ value });

    expect(execute("setting:beep_verbosity:set", "5")).toEqual(false);
    expect(execute("setting:bot_origin_quadrant:set", "2.5")).toEqual(false);
    expect(execute("setting:landing_page:set", "unknown-page")).toEqual(false);
    expect(setWebAppConfigValue).not.toHaveBeenCalled();

    expect(execute("setting:beep_verbosity:set", "3")).not.toEqual(false);
    expect(setWebAppConfigValue).toHaveBeenCalledWith("beep_verbosity", 3);
  });

  it("keeps a custom current landing page available", () => {
    const state = stateWithResources();
    const config = getWebAppConfig(state.resources.index);
    if (!config) { throw new Error("Web app config not found."); }
    config.body.landing_page = "custom-page";
    const command = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "setting:landing_page:set");

    expect(firstInputOptions(command)).toContainEqual({
      label: "custom-page (Current)",
      value: "custom-page",
    });
  });

  it("confirms unstable FarmBot OS release channels", () => {
    const updateConfig = jest.spyOn(deviceActions, "updateConfig")
      .mockImplementation(update => ({ update }) as never);
    const confirm = jest.spyOn(window, "confirm").mockReturnValue(false);
    const command = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "fbos-setting:update_channel:set");

    expect(command?.execute({ value: "beta" })).toEqual(false);
    expect(updateConfig).not.toHaveBeenCalled();
    confirm.mockReturnValue(true);
    expect(command?.execute({ value: "beta" })).not.toEqual(false);
    expect(updateConfig).toHaveBeenCalledWith({ update_channel: "beta" });
  });

  it("toggles perspective view in both directions", () => {
    const state = stateWithResources();
    const dispatch = jest.fn();
    const command = () => buildCommands({
      state, dispatch, navigate: jest.fn(),
    }).find(item => item.id == "camera:view")
      ?.actions?.find(action => action.id == "toggle-perspective");

    command()?.execute();
    state.resources.consumers.farm_designer.threeDPerspective = false;
    command()?.execute();

    expect(dispatch.mock.calls.map(call => call[0])).toEqual([
      { type: Actions.SET_3D_PERSPECTIVE, payload: false },
      { type: Actions.SET_3D_PERSPECTIVE, payload: true },
    ]);

    const info = jest.spyOn(toast, "info").mockImplementation(jest.fn());
    state.resources.consumers.farm_designer.threeDCameraFollow = true;
    command()?.execute();
    expect(info).toHaveBeenCalledWith(CAMERA_FOLLOW_PERSPECTIVE_REQUIRED);
    expect(dispatch).toHaveBeenCalledTimes(2);
    state.resources.consumers.farm_designer.threeDCameraFollow = false;
    state.resources.consumers.farm_designer.threeDUTMFollow = true;
    command()?.execute();
    expect(info).toHaveBeenCalledWith(UTM_FOLLOW_PERSPECTIVE_REQUIRED);
    expect(dispatch).toHaveBeenCalledTimes(2);
    info.mockRestore();
  });

  // eslint-disable-next-line complexity
  it("toggles 3D follow modes and bounds", () => {
    const state = stateWithResources();
    const dispatch = jest.fn();
    const set3DConfigValue = jest.fn();
    jest.spyOn(threeDSettings, "findOrCreate3DConfigFunction")
      .mockReturnValue(set3DConfigValue);
    const commands = buildCommands({
      state, dispatch, navigate: jest.fn(),
    });
    const find = (id: string) => commands.find(command => command.id == id);

    const cameraView = find("camera:view");
    expect(cameraView?.actions?.map(action => action.name)).toEqual([
      "Toggle Perspective", "Reset", "Follow Camera", "Follow UTM",
    ]);
    expect(find("camera:bounds")).toMatchObject({
      name: "Bounds",
      imageIcon: TAB_ICON[Panel.Settings],
      group: "settings",
      toggleValue: false,
    });

    const followCameraView = cameraView?.actions?.find(action =>
      action.id == "follow-camera");
    const followUtm = cameraView?.actions?.find(action =>
      action.id == "follow-utm");
    const bounds = find("camera:bounds");
    bounds?.accessory?.(jest.fn());
    followCameraView?.execute();
    followUtm?.execute();
    cameraView?.actions?.find(action => action.id == "reset-view")?.execute();
    bounds?.execute();

    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_CAMERA_FOLLOW,
      payload: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_UTM_FOLLOW,
      payload: true,
    });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_3D_VIEW,
      payload: { reset: true, nonce: expect.any(Number) },
    });
    expect(set3DConfigValue).toHaveBeenCalledWith("bounds", "1");
  });

  it("labels orbit commands by surface and direction", () => {
    const dispatch = jest.fn();
    const commands = buildCommands({
      state: fakeState(), dispatch, navigate: jest.fn(),
    });
    expect(commands.filter(command => command.id.startsWith("camera:orbit:"))
      .map(command => command.name)).toEqual([
      "Orbit to Top", "Orbit to Corner", "Orbit to Side",
    ]);
    const corners = [
      ["Orbit to Corner +X -Y", [1, -1, 1]],
      ["Orbit to Corner -X -Y", [-1, -1, 1]],
      ["Orbit to Corner -X +Y", [-1, 1, 1]],
      ["Orbit to Corner +X +Y", [1, 1, 1]],
    ] as const;

    expect(commands.find(command => command.id == "camera:orbit:top")
      ?.actions?.map(action => action.name))
      .toEqual(["Top", "Top +X", "Top +Y", "Top -X", "Top -Y"]);
    const cornerCommand = commands.find(command =>
      command.id == "camera:orbit:corner");
    expect(cornerCommand?.actions?.map(action => action.name))
      .toEqual(["+X -Y", "+X +Y", "-X +Y", "-X -Y"]);
    expect(commands.find(command => command.id == "camera:orbit:side")
      ?.actions?.map(action => action.name))
      .toEqual([
        "+X -Y", "+X", "+X +Y", "+Y", "-X +Y", "-X", "-X -Y", "-Y",
      ]);

    corners.map(([name]) => cornerCommand?.actions
      ?.find(action => action.name == name.replace("Orbit to Corner ", ""))
      ?.execute());

    expect(dispatch.mock.calls.map(call => call[0])).toEqual(
      corners.map(([, direction]) => ({
        type: Actions.SET_3D_VIEW,
        payload: { direction, nonce: expect.any(Number) },
      })));
  });

  it("uses Settings panel titles for log settings", () => {
    const commands = buildCommands({
      state: stateWithResources(), dispatch: jest.fn(), navigate: jest.fn(),
    });
    const expectedNames = {
      assertion: DeviceSetting.logFilterLevelAssertion,
      success: DeviceSetting.logFilterLevelSuccess,
      busy: DeviceSetting.logFilterLevelBusy,
      warn: DeviceSetting.logFilterLevelWarn,
      error: DeviceSetting.logFilterLevelError,
      info: DeviceSetting.logFilterLevelInfo,
      fun: DeviceSetting.logFilterLevelFun,
      debug: DeviceSetting.logFilterLevelDebug,
    };

    Object.entries(expectedNames).map(([logType, name]) =>
      expect(commands.find(command =>
        command.id == `setting:${logType}_log:set`)?.name).toEqual(name));
  });

  it("toggles the 3D laser", () => {
    const state = fakeState();
    const webAppConfig = fakeWebAppConfig();
    webAppConfig.body.three_d_garden = true;
    state.resources = buildResourceIndex([webAppConfig]);
    const setValue = jest.fn();
    const getValue = jest.spyOn(threeDSettings, "get3DConfigValueFunction")
      .mockReturnValue(() => 0);
    jest.spyOn(threeDSettings, "findOrCreate3DConfigFunction")
      .mockReturnValue(setValue);
    const command = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == "laser");

    expect(command).toMatchObject({
      name: "Laser",
      icon: "crosshairs",
      unavailable: undefined,
      accessory: expect.any(Function),
    });
    command?.execute();
    expect(setValue).toHaveBeenCalledWith("laser", "1");
    getValue.mockReturnValue(() => 1);
    buildCommands({ state, dispatch: jest.fn(), navigate: jest.fn() })
      .find(item => item.id == "laser")?.execute();
    expect(setValue).toHaveBeenCalledWith("laser", "0");
  });

  it("uses the default pin when verifying without a configured sensor", () => {
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const command = buildCommands({
      state: fakeState(), dispatch: jest.fn(), navigate: jest.fn(),
    }).find(command => command.id == "panel:tools");

    expect(command).toMatchObject({
      imageIcon: TAB_ICON[Panel.Tools],
      themeAwareImageIcon: true,
    });
    command?.actions?.find(action => action.id == "verify-tool")?.execute();

    expect(readPin).toHaveBeenCalledWith(63, "pin63", 0);
  });

  // eslint-disable-next-line complexity
  it("executes resource creation and navigation contracts", () => {
    location.pathname = Path.designer();
    const state = stateWithResources();
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const copySequence = jest.spyOn(sequenceActions, "copySequence")
      .mockReturnValue("copy-sequence" as never);
    const copyRegimen = jest.spyOn(regimenActions, "copyRegimen")
      .mockReturnValue("copy-regimen" as never);
    const addSequence = jest.spyOn(folderActions, "addNewSequenceToFolder")
      .mockImplementation(jest.fn());
    const addRegimen = jest.spyOn(regimenListActions, "addRegimen")
      .mockReturnValue("add-regimen" as never);
    const commands = buildCommands({ state, dispatch, navigate });
    const execute = (id: string) =>
      commands.find(command => command.id == id)?.execute();
    const sequence = selectAllSequences(state.resources.index)[0];
    const sequenceCommand = commands.find(command =>
      command.id == `sequence:${sequence.uuid}`);
    const executeSequenceAction = (id: string) =>
      sequenceCommand?.actions?.find(action => action.id == id)?.execute();

    executeSequenceAction("preview");
    expect(navigate).toHaveBeenCalledWith(Path.designer());
    executeSequenceAction("open");
    expect(navigate).toHaveBeenCalledWith(Path.sequences("fake"));
    executeSequenceAction("copy");
    expect(copySequence).toHaveBeenCalledWith(navigate, sequence);
    expect(dispatch).toHaveBeenCalledWith("copy-sequence");
    executeSequenceAction("schedule");
    expect(navigate).toHaveBeenCalledWith(farmEventSchedulePath(
      "Sequence", sequence.body.id || 0));

    const regimen = selectAllRegimens(state.resources.index)[0];
    const regimenCommand = commands.find(command =>
      command.id == `regimen:${regimen.uuid}`);
    const executeRegimenAction = (id: string) =>
      regimenCommand?.actions?.find(action => action.id == id)?.execute();
    executeRegimenAction("open");
    expect(navigate).toHaveBeenCalledWith(Path.regimens("Foo"));
    executeRegimenAction("copy");
    expect(copyRegimen).toHaveBeenCalledWith(navigate, regimen);
    expect(dispatch).toHaveBeenCalledWith("copy-regimen");
    executeRegimenAction("schedule");
    expect(navigate).toHaveBeenCalledWith(farmEventSchedulePath(
      "Regimen", regimen.body.id || 0));

    commands.find(command => command.id == "panel:points")
      ?.actions?.find(action => action.id == "add-new")?.execute();
    expect(navigate).toHaveBeenCalledWith(Path.points("add"));
    commands.find(command => command.id == "panel:sequences")
      ?.actions?.find(action => action.id == "add-new")?.execute();
    expect(addSequence).toHaveBeenCalledWith(navigate);
    commands.find(command => command.id == "panel:regimens")
      ?.actions?.find(action => action.id == "add-new")?.execute();
    expect(addRegimen).toHaveBeenCalledWith(1, navigate);
    expect(dispatch).toHaveBeenCalledWith("add-regimen");
    execute(`regimen:${regimen.uuid}`);
    expect(navigate).toHaveBeenLastCalledWith(Path.regimens("Foo"));
    const slot = selectAllToolSlotPointers(state.resources.index)[0];
    commands.find(command => command.id == `tool-slot:${slot.uuid}`)
      ?.actions?.find(action => action.id == "open")?.execute();
    expect(navigate).toHaveBeenCalledWith(Path.toolSlots(slot.body.id));
  });

  it("builds location resource commands with four inline actions", () => {
    localStorage.setItem("myBotIs", "online");
    const state = stateWithResources();
    state.bot.hardware.location_data.position.z = 55;
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => ({ type: "destroy", uuid }) as never);
    const commands = buildCommands({ state, dispatch, navigate });
    const index = state.resources.index;
    const plant = selectAllPlantPointers(index)[0];
    const point = selectAllGenericPointers(index)[0];
    const weed = selectAllWeedPointers(index)[0];
    const tool = selectAllTools(index)[0];
    const slot = selectAllToolSlotPointers(index)[0];
    const resources = [
      { id: `plant:${plant.uuid}`, resource: plant,
        path: Path.plants(plant.body.id), location: plant.body },
      { id: `point:${point.uuid}`, resource: point,
        path: Path.points(point.body.id), location: point.body },
      { id: `weed:${weed.uuid}`, resource: weed,
        path: Path.weeds(weed.body.id), location: weed.body },
      { id: `tool:${tool.uuid}`, resource: tool,
        path: Path.tools(tool.body.id), location: slot.body },
      { id: `tool-slot:${slot.uuid}`, resource: slot,
        path: Path.toolSlots(slot.body.id), location: slot.body },
    ];

    resources.map(({ id, path, resource, location }) => {
      const command = commands.find(item => item.id == id);
      expect(command?.name).toEqual(
        `${resource.body.name} (${location.x}, ${location.y}, ${location.z})`);
      expect(command?.actions?.map(action => action.name)).toEqual([
        "Go (XY)", "Go (XYZ)", "Open", "Delete",
      ]);
      command?.actions?.find(action => action.id == "open")?.execute();
      expect(navigate).toHaveBeenLastCalledWith(path);
    });
    expect(resources.map(({ id }) => commands.find(command =>
      command.id == id)?.imageIcon)).toEqual([
      findCropIcon(plant.body.openfarm_slug),
      TAB_ICON[Panel.Points], TAB_ICON[Panel.Weeds],
      TAB_ICON[Panel.Tools], TAB_ICON[Panel.Tools],
    ]);
    expect(commands.find(command => command.id == `plant:${plant.uuid}`)
      ?.themeAwareImageIcon).toBeFalsy();

    [plant, point, weed, slot].map(resource => commands.find(command =>
      command.id.endsWith(resource.uuid))?.actions
      ?.find(action => action.id == "delete")?.execute());
    expect(destroy.mock.calls.map(call => call[0])).toEqual([
      plant.uuid, point.uuid, weed.uuid, slot.uuid,
    ]);
    expect(commands.find(command => command.id == `tool:${tool.uuid}`)
      ?.actions?.find(action => action.id == "delete")?.unavailable)
      .toEqual("Cannot delete while in a slot.");
    commands.find(command => command.id == `tool:${tool.uuid}`)
      ?.actions?.find(action => action.id == "go-xyz")?.execute();
    commands.find(command => command.id == `tool-slot:${slot.uuid}`)
      ?.actions?.find(action => action.id == "go-xy")?.execute();
    expect(moveAbsolute).toHaveBeenNthCalledWith(1, {
      x: slot.body.x, y: slot.body.y, z: slot.body.z,
    });
    expect(moveAbsolute).toHaveBeenNthCalledWith(2, {
      x: slot.body.x, y: slot.body.y, z: 55,
    });
    const filtered = searchCommands(commands, `${plant.body.name} Delete`)
      .find(command => command.id == `plant:${plant.uuid}`);
    expect(filtered?.actions?.map(action => action.name)).toEqual(["Delete"]);
  });

  it("handles unassigned and mounted tool command actions", () => {
    localStorage.setItem("myBotIs", "online");
    const tool = fakeTool();
    tool.body.id = 401;
    const freeTool = fakeTool();
    freeTool.body.id = 402;
    freeTool.body.name = "Free tool";
    const state = fakeState();
    state.resources = buildResourceIndex([
      fakeDevice({ mounted_tool_id: tool.body.id }), tool, freeTool,
    ]);
    const dispatch = jest.fn();
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const destroy = jest.spyOn(crud, "destroy")
      .mockImplementation(uuid => ({ type: "destroy", uuid }) as never);
    const commands = buildCommands({ state, dispatch, navigate: jest.fn() });
    const command = commands.find(item => item.id == `tool:${tool.uuid}`);
    const go = command?.actions?.find(action => action.id == "go-xy");
    const remove = command?.actions?.find(action => action.id == "delete");

    expect(go?.unavailable)
      .toEqual("No location is assigned to this resource.");
    expect(command?.name).toEqual(tool.body.name);
    go?.execute();
    expect(moveAbsolute).not.toHaveBeenCalled();
    expect(remove?.unavailable).toEqual("Cannot delete while mounted.");
    const freeRemove = commands.find(item =>
      item.id == `tool:${freeTool.uuid}`)?.actions
      ?.find(action => action.id == "delete");
    expect(freeRemove?.unavailable).toBeUndefined();
    freeRemove?.execute();
    expect(destroy).toHaveBeenCalledWith(freeTool.uuid);
  });

  it("opens named curves, groups, gardens, and scene objects", () => {
    const state = stateWithResources();
    const index = state.resources.index;
    const group = selectAllPointGroups(index)[0];
    group.body.member_count = 51;
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const commands = buildCommands({ state, dispatch, navigate });
    const curve = selectAllCurves(index)[0];
    const garden = selectAllSavedGardens(index)[0];
    const sceneObject = selectAllSceneObjects(index)[0];
    const resources = [
      { id: `curve:${curve.uuid}`, name: curve.body.name,
        path: Path.curves(curve.body.id), actions: ["Open"] },
      { id: `group:${group.uuid}`, name: `${group.body.name} (51)`,
        path: Path.groups(group.body.id), actions: ["Open"] },
      { id: `garden:${garden.uuid}`, name: garden.body.name,
        path: Path.savedGardens(garden.body.id), actions: ["Open", "Apply"] },
      { id: `scene-object:${sceneObject.uuid}`, name: sceneObject.body.name,
        path: Path.sceneObjects(sceneObject.body.id), actions: ["Open"] },
    ];

    resources.map(resource => {
      const command = commands.find(item => item.id == resource.id);
      expect(command?.name).toEqual(resource.name);
      expect(command?.actions?.map(action => action.name))
        .toEqual(resource.actions);
      command?.actions?.[0].execute();
      expect(navigate).toHaveBeenLastCalledWith(resource.path);
    });
    const apply = commands.find(item => item.id == `garden:${garden.uuid}`)
      ?.actions?.find(action => action.id == "apply");
    expect(apply?.unavailable)
      .toEqual("Please clear current garden first. (1 plants)");
    expect(dispatch).toHaveBeenCalledTimes(4);
  });

  it("applies a named garden when the current garden is empty", () => {
    const garden = fakeSavedGarden();
    garden.body.id = 501;
    const state = fakeState();
    state.resources = buildResourceIndex([garden]);
    const dispatch = jest.fn();
    const navigate = jest.fn();
    const applyGarden = jest.spyOn(savedGardenActions, "applyGarden")
      .mockReturnValue("apply-garden" as never);
    const commands = buildCommands({ state, dispatch, navigate });
    const command = commands.find(item => item.id == `garden:${garden.uuid}`);
    const apply = command?.actions?.find(action => action.id == "apply");

    expect(apply?.unavailable).toBeUndefined();
    apply?.execute();
    expect(applyGarden).toHaveBeenCalledWith(navigate, garden.body.id);
    expect(dispatch).toHaveBeenCalledWith("apply-garden");
    const filtered = searchCommands(commands, `${garden.body.name} Apply`)
      .find(item => item.id == `garden:${garden.uuid}`);
    expect(filtered?.actions?.map(action => action.name)).toEqual(["Apply"]);
  });

  it("disables Apply for an unsaved garden", () => {
    const garden = fakeSavedGarden();
    garden.body.id = undefined;
    const state = fakeState();
    state.resources = buildResourceIndex([garden]);
    const dispatch = jest.fn();
    const command = buildCommands({
      state, dispatch, navigate: jest.fn(),
    }).find(item => item.id == `garden:${garden.uuid}`);
    const apply = command?.actions?.find(action => action.id == "apply");

    expect(apply?.unavailable).toEqual("Save before applying.");
    apply?.execute();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("builds named sensor commands with read and open actions", () => {
    localStorage.setItem("myBotIs", "online");
    const state = stateWithResources();
    const setPanel = jest.fn();
    const dispatch = jest.fn((action: Function) => action(setPanel));
    const navigate = jest.fn();
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const commands = buildCommands({ state, dispatch, navigate });
    const sensor = selectAllSensors(state.resources.index)[0];
    const command = commands.find(item => item.id == `sensor:${sensor.uuid}`);

    expect(command).toMatchObject({
      name: sensor.body.label,
      imageIcon: TAB_ICON[Panel.Sensors],
      themeAwareImageIcon: true,
    });
    expect(command?.actions?.map(action => action.name))
      .toEqual(["Read", "Open"]);
    command?.actions?.find(action => action.id == "read")?.execute();
    expect(readPin).toHaveBeenCalledWith(
      sensor.body.pin, `pin${sensor.body.pin}`, sensor.body.mode);
    command?.actions?.find(action => action.id == "open")?.execute();
    expect(navigate).toHaveBeenCalledWith(Path.sensors());
    expect(setPanel).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
    const filtered = searchCommands(
      commands, `${sensor.body.label} Read`)
      .find(item => item.id == `sensor:${sensor.uuid}`);
    expect(filtered?.actions?.map(action => action.name)).toEqual(["Read"]);
  });

  it("keeps unconfigured sensor navigation available", () => {
    localStorage.setItem("myBotIs", "online");
    const sensor = fakeSensor();
    sensor.body.pin = undefined;
    const state = fakeState();
    state.resources = buildResourceIndex([fakeDevice(), sensor]);
    const readPin = jest.spyOn(deviceActions, "readPin")
      .mockImplementation(jest.fn());
    const command = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    }).find(item => item.id == `sensor:${sensor.uuid}`);
    const read = command?.actions?.find(action => action.id == "read");
    const open = command?.actions?.find(action => action.id == "open");

    expect(read?.unavailable).toEqual("Sensor has no pin assigned.");
    expect(open?.unavailable).toBeUndefined();
    read?.execute();
    expect(readPin).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line complexity
  it("describes invalid inputs and locked/offline states", () => {
    const state = stateWithResources();
    localStorage.removeItem("myBotIs");
    state.bot.hardware.informational_settings.locked = true;
    const commands = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    });
    const move = commands.find(command => command.id == "farmbot:move:x");
    const coordinates = commands.find(command =>
      command.id == "farmbot:move-to:coordinates");
    expect(coordinates?.icon).toEqual(move?.icon);
    expect(coordinates?.actions?.[0].input?.validate?.({
      x: "x", y: "2", z: "3",
    }))
      .toEqual("Enter valid X, Y, and Z coordinates.");
    expect(coordinates?.actions?.[0].input?.validate?.({
      x: "", y: "2", z: "3",
    }))
      .toEqual("Enter valid X, Y, and Z coordinates.");
    expect(coordinates?.actions?.[0].input?.validate?.({
      x: "1", y: "2", z: "3",
    }))
      .toBeUndefined();
    const analogPeripheral = selectAllPeripherals(state.resources.index)
      .find(peripheral => peripheral.body.mode == 1);
    const analog = commands.find(command =>
      command.id == `farmbot:peripheral:${analogPeripheral?.uuid}`);
    const validateAnalog = analog?.actions?.[0].input?.validate;
    ["", "-1", "1.5", "256", "invalid"].map(value =>
      expect(validateAnalog?.({ value }))
        .toEqual("Enter a whole number from 0 to 255."));
    expect(validateAnalog?.({ value: "255" })).toBeUndefined();
    expect(validNumberInput({ value: "" })).toEqual("Enter a valid number.");
    expect(validNumberInput({ value: "10" })).toBeUndefined();
    expect(move?.unavailable).toEqual("FarmBot is offline.");
    localStorage.setItem("myBotIs", "online");
    const locked = buildCommands({
      state, dispatch: jest.fn(), navigate: jest.fn(),
    });
    expect(locked.find(command => command.id == "farmbot:move:x")
      ?.unavailable).toEqual("Emergency stop is active.");
  });
});
