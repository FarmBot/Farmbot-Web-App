const mockDevSettings: { [key: string]: string } = {};
import React from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import TestRenderer from "react-test-renderer";
import {
  DevWidgetFERow, DevWidgetFBOSRow, DevWidgetDelModeRow,
  DevWidgetShowInternalEnvsRow,
  DevWidget3dCameraRow,
  DevWidgetAllOrderOptionsRow,
  DevWidgetChunkingDisabledRow,
  Dev3dDebugSettings,
} from "../dev_settings";
import { fakeState } from "../../../__test_support__/fake_state";
import { DevSettings } from "../dev_support";
import * as configStorageActions from "../../../config_storage/actions";
import * as crud from "../../../api/crud";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { fakeFarmwareEnv } from "../../../__test_support__/fake_state/resources";
import { store } from "../../../redux/store";

const blurableInputMock = jest.fn((props: {
  value?: string | number,
  type?: string,
  error?: string,
  onCommit?: (event: React.FormEvent<HTMLInputElement>) => void,
}) =>
  <input
    type={props.type}
    defaultValue={props.value as string | undefined}
    className={props.error ? "error" : ""}
    onBlur={event => props.onCommit?.(event)}
    onChange={() => { }} />,
);

jest.mock("../../../ui", () => {
  const actual = jest.requireActual("../../../ui");
  return {
    ...actual,
    BlurableInput: (props: unknown) => blurableInputMock(props as never),
  };
});

const mockState = fakeState();
let setWebAppConfigValueSpy: jest.SpyInstance;
let getWebAppConfigValueSpy: jest.SpyInstance;
let initSaveSpy: jest.SpyInstance;
let editSpy: jest.SpyInstance;
let saveSpy: jest.SpyInstance;
let originalDispatch: typeof store.dispatch;
let originalGetState: typeof store.getState;
const toggleButton = (container: HTMLElement) =>
  container.querySelector("button") as HTMLButtonElement;
const commitInput = (container: HTMLElement, value: string) => {
  const input = container.querySelector("input") as HTMLInputElement;
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};
const expectRemovedFromInternalUse = (key: string) => {
  const latestCall = setWebAppConfigValueSpy.mock.calls.at(-1) as [string, string];
  expect(latestCall?.[0]).toEqual("internal_use");
  const savedConfig = JSON.parse(latestCall?.[1] || "{}") as Record<string, string>;
  expect(savedConfig[key]).toBeUndefined();
};

beforeEach(() => {
  jest.clearAllMocks();
  blurableInputMock.mockClear();
  Object.keys(mockDevSettings).forEach(key => delete mockDevSettings[key]);
  localStorage.removeItem("DISABLE_CHUNKING");
  setWebAppConfigValueSpy = jest.spyOn(configStorageActions, "setWebAppConfigValue")
    .mockImplementation(() => () => { });
  getWebAppConfigValueSpy = jest.spyOn(configStorageActions, "getWebAppConfigValue")
    .mockImplementation(() => () => JSON.stringify(mockDevSettings));
  initSaveSpy = jest.spyOn(crud, "initSave").mockImplementation(jest.fn());
  editSpy = jest.spyOn(crud, "edit").mockImplementation(jest.fn());
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  originalDispatch = store.dispatch;
  originalGetState = store.getState;
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch = jest.fn();
  (store as unknown as { getState: typeof store.getState }).getState = () => mockState;
});

afterEach(() => {
  cleanup();
  setWebAppConfigValueSpy.mockRestore();
  getWebAppConfigValueSpy.mockRestore();
  initSaveSpy.mockRestore();
  editSpy.mockRestore();
  saveSpy.mockRestore();
  (store as unknown as { dispatch: typeof store.dispatch }).dispatch = originalDispatch;
  (store as unknown as { getState: typeof store.getState }).getState = originalGetState;
});

afterAll(() => {
  jest.unmock("../../../ui");
});

describe("<DevWidgetFBOSRow />", () => {
  it("changes override value", () => {
    const { container } = render(<DevWidgetFBOSRow />);
    commitInput(container, "1.2.3");
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1.2.3" }));
    const remove = container.querySelector(".fa-times") as HTMLButtonElement;
    fireEvent.click(remove);
    expectRemovedFromInternalUse(DevSettings.FBOS_VERSION_OVERRIDE);
  });

  it("increases override value", () => {
    const { container } = render(<DevWidgetFBOSRow />);
    const increase = container.querySelector(".fa-angle-double-up") as HTMLButtonElement;
    fireEvent.click(increase);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.FBOS_VERSION_OVERRIDE]: "1000.0.0" }));
    const remove = container.querySelector(".fa-times") as HTMLButtonElement;
    fireEvent.click(remove);
    expectRemovedFromInternalUse(DevSettings.FBOS_VERSION_OVERRIDE);
  });
});

describe("<DevWidgetFERow />", () => {
  it("enables unstable FE features", () => {
    const enabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
      .mockReturnValue(false);
    const enableSpy = jest.spyOn(DevSettings, "enableFutureFeatures")
      .mockImplementation(jest.fn());
    const { container } = render(<DevWidgetFERow />);
    fireEvent.click(toggleButton(container));
    expect(enableSpy).toHaveBeenCalled();
    enabledSpy.mockRestore();
    enableSpy.mockRestore();
    delete mockDevSettings[DevSettings.FUTURE_FE_FEATURES];
  });

  it("disables unstable FE features", () => {
    const enabledSpy = jest.spyOn(DevSettings, "futureFeaturesEnabled")
      .mockReturnValue(true);
    const disableSpy = jest.spyOn(DevSettings, "disableFutureFeatures")
      .mockImplementation(jest.fn());
    const { container } = render(<DevWidgetFERow />);
    fireEvent.click(toggleButton(container));
    expect(disableSpy).toHaveBeenCalled();
    disableSpy.mockRestore();
    enabledSpy.mockRestore();
  });
});

describe("<DevWidget3dCameraRow />", () => {
  const MOCK_CAMERA_VALUE = "{\"position\": [0, 0, 0], \"target\": [0, 0, 0]}";

  it("changes dev camera value", () => {
    const { container } = render(<DevWidget3dCameraRow />);
    commitInput(container, MOCK_CAMERA_VALUE);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.CAMERA3D]: MOCK_CAMERA_VALUE }));
    const remove = container.querySelector(".fa-times") as HTMLButtonElement;
    fireEvent.click(remove);
    expectRemovedFromInternalUse(DevSettings.CAMERA3D);
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("handles invalid dev camera value", () => {
    mockDevSettings[DevSettings.CAMERA3D] = "{";
    const { container } = render(<DevWidget3dCameraRow />);
    expect(container.querySelector("input.error")).toBeTruthy();
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("enables dev camera position", () => {
    const { container } = render(<DevWidget3dCameraRow />);
    const increase = container.querySelector(".fa-angle-double-up") as HTMLButtonElement;
    fireEvent.click(increase);
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({
        [DevSettings.CAMERA3D]: JSON.stringify(
          { position: [-500, -500, 400], target: [-1500, -200, 200] })
      }));
    delete mockDevSettings[DevSettings.CAMERA3D];
  });

  it("disables dev camera position", () => {
    mockDevSettings[DevSettings.CAMERA3D] = MOCK_CAMERA_VALUE;
    const { container } = render(<DevWidget3dCameraRow />);
    const remove = container.querySelector(".fa-times") as HTMLButtonElement;
    fireEvent.click(remove);
    expectRemovedFromInternalUse(DevSettings.CAMERA3D);
    delete mockDevSettings[DevSettings.CAMERA3D];
  });
});

describe("<DevWidgetDelModeRow />", () => {
  it("enables delete mode", () => {
    const { container } = render(<DevWidgetDelModeRow />);
    fireEvent.click(toggleButton(container));
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.QUICK_DELETE_MODE]: "true" }));
    delete mockDevSettings[DevSettings.QUICK_DELETE_MODE];
  });

  it("disables delete mode", () => {
    const enabledSpy = jest.spyOn(DevSettings, "quickDeleteEnabled")
      .mockReturnValue(true);
    const disableSpy = jest.spyOn(DevSettings, "disableQuickDelete")
      .mockImplementation(jest.fn());
    const { container } = render(<DevWidgetDelModeRow />);
    fireEvent.click(toggleButton(container));
    expect(disableSpy).toHaveBeenCalled();
    disableSpy.mockRestore();
    enabledSpy.mockRestore();
  });
});

describe("<DevWidgetShowInternalEnvsRow />", () => {
  it("enables show internal envs", () => {
    const enabledSpy = jest.spyOn(DevSettings, "showInternalEnvsEnabled")
      .mockReturnValue(false);
    const enableSpy = jest.spyOn(DevSettings, "enableShowInternalEnvs")
      .mockImplementation(jest.fn());
    const { container } = render(<DevWidgetShowInternalEnvsRow />);
    fireEvent.click(toggleButton(container));
    expect(enableSpy).toHaveBeenCalled();
    enableSpy.mockRestore();
    enabledSpy.mockRestore();
  });

  it("disables show internal envs", () => {
    mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS] = "true";
    const enabledSpy = jest.spyOn(DevSettings, "showInternalEnvsEnabled")
      .mockReturnValue(true);
    const { container } = render(<DevWidgetShowInternalEnvsRow />);
    fireEvent.click(toggleButton(container));
    expectRemovedFromInternalUse(DevSettings.SHOW_INTERNAL_ENVS);
    enabledSpy.mockRestore();
    delete mockDevSettings[DevSettings.SHOW_INTERNAL_ENVS];
  });
});

describe("<DevWidgetAllOrderOptionsRow />", () => {
  it("enables all order options", () => {
    const { container } = render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(toggleButton(container));
    expect(setWebAppConfigValueSpy).toHaveBeenCalledWith("internal_use",
      JSON.stringify({ [DevSettings.ALL_ORDER_OPTIONS]: "true" }));
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });

  it("disables all order options", () => {
    mockDevSettings[DevSettings.ALL_ORDER_OPTIONS] = "true";
    const { container } = render(<DevWidgetAllOrderOptionsRow />);
    fireEvent.click(toggleButton(container));
    expectRemovedFromInternalUse(DevSettings.ALL_ORDER_OPTIONS);
    delete mockDevSettings[DevSettings.ALL_ORDER_OPTIONS];
  });
});

describe("<DevWidgetChunkingDisabledRow />", () => {
  it("enables chunking disabled", () => {
    const { container } = render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(toggleButton(container));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toEqual("true");
    localStorage.removeItem("DISABLE_CHUNKING");
  });

  it("disables chunking disabled", () => {
    localStorage.setItem("DISABLE_CHUNKING", "true");
    const { container } = render(<DevWidgetChunkingDisabledRow />);
    fireEvent.click(toggleButton(container));
    expect(localStorage.getItem("DISABLE_CHUNKING")).toBeFalsy();
    localStorage.removeItem("DISABLE_CHUNKING");
  });
});

describe("<Dev3dDebugSettings />", () => {
  const toggleFor = (
    wrapper: TestRenderer.ReactTestRenderer, key: string,
  ): (() => void) => {
    const label = wrapper.root.find(node =>
      Array.isArray(node.children)
      && node.children.includes(key));
    let current: TestRenderer.ReactTestInstance | null = label;
    while (current) {
      const toggles = current.findAll(node =>
        typeof node.props.toggleAction == "function");
      if (toggles.length) {
        return toggles[0].props.toggleAction as () => void;
      }
      current = current.parent;
    }
    throw new Error(`Toggle for ${key} not found.`);
  };

  it("adds env", () => {
    mockState.resources = buildResourceIndex([]);
    const wrapper = TestRenderer.create(<Dev3dDebugSettings />);
    const toggle = toggleFor(wrapper, "3D_eventDebug");
    toggle();
    expect(initSaveSpy).toHaveBeenCalledWith("FarmwareEnv", {
      key: "3D_eventDebug",
      value: 1,
    });
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it("edits env", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 0;
    mockState.resources = buildResourceIndex([env]);
    const wrapper = TestRenderer.create(<Dev3dDebugSettings />);
    const toggle = toggleFor(wrapper, "3D_eventDebug");
    toggle();
    expect(initSaveSpy).not.toHaveBeenCalled();
    expect(editSpy).toHaveBeenCalledWith(env, { value: 1 });
    expect(saveSpy).toHaveBeenCalledWith(env.uuid);
    wrapper.unmount();
  });

  it("turns off setting", () => {
    const env = fakeFarmwareEnv();
    env.body.key = "3D_eventDebug";
    env.body.value = 1;
    mockState.resources = buildResourceIndex([env]);
    const wrapper = TestRenderer.create(<Dev3dDebugSettings />);
    const toggle = toggleFor(wrapper, "3D_eventDebug");
    toggle();
    expect(initSaveSpy).not.toHaveBeenCalled();
    expect(editSpy).toHaveBeenCalledWith(env, { value: 0 });
    expect(saveSpy).toHaveBeenCalledWith(env.uuid);
    wrapper.unmount();
  });
});
