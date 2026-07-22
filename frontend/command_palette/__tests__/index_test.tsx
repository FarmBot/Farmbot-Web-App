import React from "react";
import { act, createEvent, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import {
  commandPaletteShortcut, COMMAND_PALETTE_OPEN_EVENT,
  commandPaletteStateEqual, completeCommandExecution,
  handleCommandPaletteHotkey, mapStateToCommandPaletteProps,
  openCommandPalette, RawCommandPalette, showCommandPalette,
} from "..";
import { fakeState } from "../../__test_support__/fake_state";
import * as deviceActions from "../../devices/actions";
import * as configStorageActions from "../../config_storage/actions";
import {
  COMMAND_PALETTE_RECENTS, readRecentCommandIds, readRecentCommands,
} from "../recents";
import * as commandsModule from "../commands";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakePeripheral, fakeSequence,
} from "../../__test_support__/fake_state/resources";
import { buildResourceIndex } from
  "../../__test_support__/resource_index_builder";
import * as sequenceActions from "../../sequences/actions";
import * as sequenceVisualization from
  "../../farm_designer/map/sequence_visualization";

describe("<CommandPalette />", () => {
  beforeEach(() => {
    localStorage.setItem("myBotIs", "online");
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      },
    });
  });

  const setup = () => render(<MemoryRouter>
    <RawCommandPalette appState={fakeState()} dispatch={jest.fn()}
      initialOpen={true} />
  </MemoryRouter>);

  const setupSequence = () => {
    const state = fakeState();
    const sequence = fakeSequence();
    sequence.body.name = "Water Plants";
    state.resources = buildResourceIndex([sequence]);
    const dispatch = jest.fn();
    return {
      ...render(<MemoryRouter>
        <RawCommandPalette appState={state} dispatch={dispatch}
          initialOpen={true} />
      </MemoryRouter>),
      dispatch,
      sequence,
    };
  };

  const setupFirmware = () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeFirmwareConfig()]);
    const dispatch = jest.fn();
    return {
      ...render(<MemoryRouter>
        <RawCommandPalette appState={state} dispatch={dispatch}
          initialOpen={true} />
      </MemoryRouter>),
      dispatch,
    };
  };

  const setupFbos = () => {
    const state = fakeState();
    state.resources = buildResourceIndex([fakeFbosConfig()]);
    return render(<MemoryRouter>
      <RawCommandPalette appState={state} dispatch={jest.fn()}
        initialOpen={true} />
    </MemoryRouter>);
  };

  const setupPeripheral = (pinValue?: number) => {
    const state = fakeState();
    const peripheral = fakePeripheral();
    peripheral.body.label = "Lighting";
    state.resources = buildResourceIndex([peripheral]);
    const pin = peripheral.body.pin || -1;
    delete state.bot.hardware.pins[pin];
    if (pinValue !== undefined) {
      state.bot.hardware.pins[pin] = { mode: 0, value: pinValue };
    }
    return render(<MemoryRouter>
      <RawCommandPalette appState={state} dispatch={jest.fn()}
        initialOpen={true} />
    </MemoryRouter>);
  };

  it("opens, searches, navigates, and closes from the keyboard", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS,
      JSON.stringify(["farmbot:photo"]));
    const { container, getByLabelText } = setup();
    const dialog = container.querySelector("dialog");
    expect(dialog?.hasAttribute("open")).toEqual(true);
    expect(container.querySelector(".command-palette-hotkeys")?.textContent)
      .toEqual("Esc");
    expect(container.querySelector(".command-palette-footer")?.textContent)
      .toContain("Navigate");
    expect(container.querySelector(".command-palette-footer")?.textContent)
      .toContain("Select");
    const search = getByLabelText("Search commands");
    expect(search).toHaveAttribute(
      "placeholder", "Search commands, settings, and navigations...");
    expect(document.activeElement).toEqual(search);
    fireEvent.change(search, { target: { value: "take photo" } });
    expect(container.querySelector("[aria-selected='true']")?.textContent)
      .toContain("Take photo");
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(search, { key: "ArrowUp" });
    fireEvent.click(getByLabelText("Close command palette"));
    expect(dialog?.hasAttribute("open")).toEqual(false);
    const close = jest.fn();
    const show = jest.fn();
    const event = {
      metaKey: true, ctrlKey: false, shiftKey: false, code: "KeyK",
      preventDefault: jest.fn(), stopPropagation: jest.fn(),
    } as unknown as KeyboardEvent;
    handleCommandPaletteHotkey(false, close, show, event);
    expect(show).toHaveBeenCalled();
    handleCommandPaletteHotkey(true, close, show, event);
    expect(close).toHaveBeenCalled();
    handleCommandPaletteHotkey(false, close, show, {
      ...event, metaKey: false, code: "KeyA",
    });
    const setQuery = jest.fn();
    const setSelected = jest.fn();
    const setSelectedAction = jest.fn();
    const setValidationError = jest.fn();
    const setOpen = jest.fn();
    const setters = [
      setQuery, setSelected, setSelectedAction, setValidationError, setOpen,
    ];
    showCommandPalette(
      setQuery, setSelected, setSelectedAction, setValidationError, setOpen);
    expect(setters.map(setter => setter.mock.calls[0]?.[0]))
      .toEqual(["", 0, 0, undefined, true]);
    const state = fakeState();
    expect(mapStateToCommandPaletteProps(state)).toEqual({ appState: state });
  });

  it("uses the search field as the upward navigation boundary", () => {
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    const selectedOptions = () => container.querySelectorAll(
      ".command-palette-option.selected");

    expect(selectedOptions()).toHaveLength(1);
    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(search).toHaveClass("selected");
    expect(search).toHaveFocus();
    expect(selectedOptions()).toHaveLength(0);

    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(search).toHaveClass("selected");
    expect(selectedOptions()).toHaveLength(0);

    fireEvent.change(search, { target: { value: "plant" } });
    expect(search).not.toHaveClass("selected");
    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(search).toHaveClass("selected");
    expect(selectedOptions()).toHaveLength(0);
    const filteredOptions = container.querySelectorAll(
      ".command-palette-option");
    fireEvent.keyDown(search, { key: "ArrowUp" });
    expect(search).not.toHaveClass("selected");
    expect(selectedOptions()).toHaveLength(1);
    expect(filteredOptions[filteredOptions.length - 1])
      .toHaveClass("selected");
  });

  it("opens from the application event", () => {
    const buildCommands = jest.spyOn(commandsModule, "buildCommands");
    const { container } = render(<MemoryRouter>
      <RawCommandPalette appState={fakeState()} dispatch={jest.fn()} />
    </MemoryRouter>);
    expect(buildCommands).not.toHaveBeenCalled();
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
    act(openCommandPalette);
    expect(buildCommands).toHaveBeenCalledTimes(1);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(true);
    expect(commandPaletteShortcut()).toMatch(/^(⌘K|Ctrl\+K)$/);
    expect(COMMAND_PALETTE_OPEN_EVENT).toEqual("farmbot:open-command-palette");
  });

  it("renders stacked icons and selects commands and actions on hover", () => {
    const buildCommands = jest.spyOn(commandsModule, "buildCommands")
      .mockReturnValue([
        {
          id: "stacked", name: "Stacked", englishName: "Stacked",
          group: "navigation", iconStack: { base: "circle", overlay: "leaf" },
          execute: jest.fn(),
          actions: [
            {
              id: "first", name: "First", englishName: "First",
              execute: jest.fn(),
            },
            {
              id: "second", name: "Second", englishName: "Second",
              execute: jest.fn(),
            },
          ],
        },
        {
          id: "plain", name: "Plain", englishName: "Plain",
          group: "navigation", execute: jest.fn(),
        },
      ]);
    const { container } = render(<MemoryRouter>
      <RawCommandPalette appState={fakeState()} dispatch={jest.fn()}
        initialOpen={true} />
    </MemoryRouter>);
    expect(container.querySelector(".command-palette-icon-stack .fa-circle"))
      .toBeTruthy();
    expect(container.querySelector(".command-palette-icon-stack .fa-leaf"))
      .toBeTruthy();

    const commands = container.querySelectorAll(".command-palette-option");
    fireEvent.mouseMove(commands[1]);
    expect(commands[1]).toHaveAttribute("aria-selected", "true");
    const secondAction = commands[0].querySelectorAll(
      ".command-palette-action-option")[1];
    fireEvent.mouseMove(secondAction);
    fireEvent.mouseMove(secondAction.querySelector(
      ".command-palette-action") as Element);
    expect(commands[0]).toHaveAttribute("aria-selected", "true");
    expect(commands[0].querySelectorAll(".command-palette-action")[1])
      .toHaveClass("selected");
    buildCommands.mockRestore();
  });

  it("clears unsubmitted values after a native dialog close", () => {
    localStorage.removeItem(COMMAND_PALETTE_RECENTS);
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Move X" } });
    const custom = getByLabelText(
      "Move X: Custom distance") as HTMLInputElement;
    fireEvent.change(custom, { target: { value: "42" } });
    expect(custom.value).toEqual("42");

    act(() => container.querySelector("dialog")?.close());
    act(openCommandPalette);

    expect((getByLabelText(
      "Move X: Custom distance") as HTMLInputElement).value).toEqual("");
    expect(document.activeElement).toEqual(getByLabelText("Search commands"));
  });

  it("shows the executed recent action and restores custom values", () => {
    const move = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    localStorage.setItem(COMMAND_PALETTE_RECENTS, JSON.stringify([
      { id: "farmbot:move:x", actionId: "+100" },
      {
        id: "farmbot:move:x",
        actionId: "custom",
        values: { xDistance: "42.5" },
      },
    ]));
    const { container, getAllByLabelText } = setup();
    const customInputs = getAllByLabelText("Move X: Custom distance");
    expect(customInputs).toHaveLength(3);
    const custom = customInputs[1] as HTMLInputElement;
    expect(custom.value).toEqual("42.5");
    expect((customInputs[0] as HTMLInputElement).value).toEqual("");
    expect(custom).not.toHaveClass("recent-execution");
    expect(custom.parentElement?.querySelector(
      ".command-palette-custom-move-dot"))
      .toHaveClass("recent-execution");
    const recentPreset = getAllByLabelText("Move X: +100")[0];
    expect(recentPreset).toHaveClass("selected");
    expect(recentPreset).not.toHaveClass("recent-execution");
    expect(recentPreset.parentElement?.querySelector(
      ".command-palette-action-recent-dot"))
      .toHaveClass("recent-execution");
    expect(container.querySelectorAll(".recent-execution")).toHaveLength(2);
    expect(customInputs[2]).not.toHaveClass("recent-execution");
    expect(container.querySelectorAll(".command-palette-group-label")[1]
      ?.textContent).toEqual("All commands");
    const search = getAllByLabelText("Search commands")[0];
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(custom).toHaveClass("selected");
    expect(custom).not.toHaveClass("recent-execution");
    expect(custom).toEqual(document.activeElement);
    fireEvent.keyDown(custom, { key: "ArrowUp" });
    expect(recentPreset).toHaveClass("selected");
    expect(recentPreset).not.toHaveClass("recent-execution");
    expect(search).toEqual(document.activeElement);
    fireEvent.keyDown(search, { key: "ArrowDown" });
    fireEvent.keyDown(custom, { key: "Enter" });
    expect(move).toHaveBeenCalledWith({ x: 42.5, y: 0, z: 0 });
  });

  it("clears recent commands without recording itself", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS,
      JSON.stringify(["farmbot:photo"]));
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Clear Recent Commands" } });
    fireEvent.keyDown(search, { key: "Enter" });

    expect(readRecentCommands()).toEqual([]);
    expect(localStorage.getItem(COMMAND_PALETTE_RECENTS)).toBeFalsy();
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("clears recent commands from the Recent header", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS,
      JSON.stringify(["farmbot:photo"]));
    const { getByRole, queryByText } = setup();
    fireEvent.click(getByRole("button", { name: "Clear" }));
    expect(readRecentCommands()).toEqual([]);
    expect(queryByText("Recent")).not.toBeInTheDocument();
  });

  it("keeps search focused when the first recent action has an input", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS, JSON.stringify([{
      id: "farmbot:move:x",
      actionId: "custom",
      values: { xDistance: "42.5" },
    }]));

    const { getAllByLabelText, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    const custom = getAllByLabelText("Move X: Custom distance")[0];

    expect(custom).toHaveClass("selected");
    expect(custom).not.toHaveClass("recent-execution");
    expect(custom.parentElement?.querySelector(
      ".command-palette-custom-move-dot"))
      .toHaveClass("recent-execution");
    expect(custom).toHaveValue(42.5);
    expect(search).toEqual(document.activeElement);
  });

  it("keeps safety commands open when confirmation is canceled", () => {
    const confirm = jest.spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const dispatch = jest.fn();
    const { container, getByLabelText } = render(<MemoryRouter>
      <RawCommandPalette appState={fakeState()} dispatch={dispatch}
        initialOpen={true} />
    </MemoryRouter>);
    const search = getByLabelText("Search commands");
    fireEvent.change(search, {
      target: { value: "discard unsaved" },
    });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(dispatch).not.toHaveBeenCalled();
    expect(readRecentCommandIds()).toEqual([]);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(true);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(readRecentCommandIds()).toEqual(["setting:discard_unsaved:toggle"]);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("ignores Redux updates that do not affect commands", () => {
    const state = fakeState();
    const telemetryUpdate = {
      ...state,
      bot: {
        ...state.bot,
        hardware: {
          ...state.bot.hardware,
          location_data: { ...state.bot.hardware.location_data },
        },
      },
    };
    expect(commandPaletteStateEqual(telemetryUpdate, state)).toEqual(false);
    expect(commandPaletteStateEqual({
      ...state,
      app: { ...state.app },
    }, state)).toEqual(false);
    expect(commandPaletteStateEqual({
      ...state,
      bot: {
        ...state.bot,
        hardware: {
          ...state.bot.hardware,
          pins: { ...state.bot.hardware.pins },
        },
      },
    }, state)).toEqual(false);
  });

  it("closes from a backdrop click but not an interior click", () => {
    const { container } = setup();
    const dialog = container.querySelector("dialog") as HTMLDialogElement;
    fireEvent.click(container.querySelector(".command-palette-header") as Element);
    expect(dialog.hasAttribute("open")).toEqual(true);
    fireEvent.click(dialog);
    expect(dialog.hasAttribute("open")).toEqual(false);
  });

  it("shows setting actions inline and restores them in Recents", () => {
    const setValue = jest.spyOn(configStorageActions,
      "setWebAppConfigValue").mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "set beep verbosity" } });
    const input = getByLabelText("Beep Verbosity: Set");
    expect(input).toBeVisible();
    expect(container.querySelector(".command-palette-footer")?.textContent)
      .toContain("Actions");
    fireEvent.keyDown(search, { key: "ArrowRight" });
    expect(input).toEqual(document.activeElement);
    fireEvent.click(input);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(container.textContent).toContain("Enter a valid number.");
    fireEvent.change(input, { target: { value: "3" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(setValue).toHaveBeenCalledWith("beep_verbosity", 3);
    expect(readRecentCommands()[0]).toEqual({
      id: "setting:beep_verbosity:set",
      actionId: "set",
      values: { value: "3" },
    });
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);

    const recent = setup();
    const recentInput = recent.getAllByLabelText("Beep Verbosity: Set")[0];
    expect(recentInput).toHaveValue("3");
    expect(recentInput).toHaveClass("recent-execution", "selected");
  });

  it("executes a valid input command", () => {
    const update = jest.spyOn(
      configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "set beep verbosity" } });
    const value = getByLabelText("Beep Verbosity: Set");
    fireEvent.change(value, { target: { value: "2" } });
    fireEvent.keyDown(value, { key: "Enter" });
    expect(update).toHaveBeenCalledWith("beep_verbosity", 2);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("preserves arrow-key caret navigation in single-input commands", () => {
    const { getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Map Size X" } });
    const input = getByLabelText("Map Size X: Set") as HTMLInputElement;
    input.focus();
    const event = createEvent.keyDown(input, { key: "ArrowLeft" });
    fireEvent(input, event);
    expect(event.defaultPrevented).toEqual(false);
    expect(input).toHaveFocus();
  });

  it("keeps unavailable commands open and supports interactive accessories", () => {
    localStorage.removeItem("myBotIs");
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "take photo" } });
    const unavailable = container.querySelector(".command-palette-option") as Element;
    fireEvent.mouseMove(unavailable);
    fireEvent.click(unavailable);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(true);
    fireEvent.change(search, { target: { value: "nothing matches this" } });
    fireEvent.keyDown(search, { key: "ArrowDown" });
    expect(container.textContent).toContain("No commands found");
    fireEvent.change(search, { target: { value: "dark mode" } });
    const toggle = container.querySelector(".command-palette-accessory button");
    expect(toggle).toHaveClass("fb-toggle-button", "fb-button");
    expect(toggle).not.toHaveClass("command-palette-action");
    expect(toggle).not.toHaveClass("command-palette-action-input");
    toggle && fireEvent.click(toggle);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("renders peripheral toggles as standard ToggleButton elements", () => {
    const pinToggle = jest.spyOn(deviceActions, "pinToggle")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupPeripheral(1);
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "Peripheral Lighting" },
    });
    const toggle = container.querySelector(
      ".command-palette-accessory .fb-toggle-button");
    expect(toggle).toHaveClass("fb-button", "green");
    expect(container.querySelector(".command-palette-action")).toBeFalsy();
    toggle && fireEvent.click(toggle);
    expect(pinToggle).toHaveBeenCalledWith(1);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("renders FarmBot OS log settings as toggles", () => {
    const updateConfig = jest.spyOn(deviceActions, "updateConfig")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupFbos();
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "Sequence Body Log" },
    });
    const toggle = container.querySelector(
      ".command-palette-accessory .fb-toggle-button");

    expect(toggle).toHaveClass("fb-button", "red");
    toggle && fireEvent.click(toggle);
    expect(updateConfig).toHaveBeenCalledWith({ sequence_body_log: true });
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("matches the Controls fallback for an unknown online pin value", () => {
    const { container, getByLabelText } = setupPeripheral();
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "Peripheral Lighting" },
    });
    const toggle = container.querySelector(
      ".command-palette-accessory .fb-toggle-button");
    expect(toggle).toHaveClass("red");
    expect(toggle).not.toHaveClass("yellow");
  });

  it("executes an immediate command by clicking its row", () => {
    const { container, getByLabelText } = setup();
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "open plants" },
    });
    expect(container.querySelector(".command-palette-option-icon img")
      ?.classList).toContain("theme-aware-icon");
    fireEvent.click(container.querySelector(".command-palette-option") as Element);
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("navigates and filters multi-action commands from the keyboard", () => {
    const preview = jest.spyOn(sequenceVisualization, "visualizeInMap")
      .mockReturnValue("preview-action" as never);
    const { container, dispatch, getByLabelText, sequence } = setupSequence();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Water Plants" } });
    const actionText = () => Array.from(container.querySelectorAll(
      ".command-palette-action")).map(action => action.textContent);
    const highlighted = () => container.querySelector(
      ".command-palette-action.selected")?.textContent;
    expect(actionText()).toEqual([
      "Run", "Open", "Preview", "Copy", "Schedule",
    ]);
    expect(highlighted()).toEqual("Run");
    expect(container.querySelector(".command-palette-footer")?.textContent)
      .toContain("Actions");
    fireEvent.keyDown(search, { key: "ArrowRight" });
    expect(highlighted()).toEqual("Open");
    fireEvent.keyDown(search, { key: "ArrowRight" });
    expect(highlighted()).toEqual("Preview");
    fireEvent.keyDown(search, { key: "ArrowLeft" });
    expect(highlighted()).toEqual("Open");
    fireEvent.mouseMove(getByLabelText("Water Plants: Copy"));
    expect(highlighted()).toEqual("Copy");
    fireEvent.change(search, {
      target: { value: "Water Plants Preview" },
    });
    expect(actionText()).toEqual(["Preview"]);
    expect(highlighted()).toEqual("Preview");
    fireEvent.keyDown(search, { key: "Enter" });
    expect(preview).toHaveBeenCalledWith(sequence.uuid);
    expect(dispatch).toHaveBeenCalledWith("preview-action");
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("executes a multi-action command by clicking an option", () => {
    const copy = jest.spyOn(sequenceActions, "copySequence")
      .mockReturnValue("copy-action" as never);
    const { container, dispatch, getByLabelText, sequence } = setupSequence();
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "Water Plants" },
    });
    fireEvent.click(getByLabelText("Water Plants: Copy"));
    expect(copy).toHaveBeenCalledWith(expect.any(Function), sequence);
    expect(dispatch).toHaveBeenCalledWith("copy-action");
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("executes the highlighted option by clicking its command row", () => {
    const preview = jest.spyOn(sequenceVisualization, "visualizeInMap")
      .mockReturnValue("preview-action" as never);
    const { container, dispatch, getByLabelText, sequence } = setupSequence();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Water Plants" } });
    fireEvent.keyDown(search, { key: "ArrowRight" });
    fireEvent.keyDown(search, { key: "ArrowRight" });
    fireEvent.mouseMove(container.querySelector(
      ".command-palette-option-copy") as Element);
    fireEvent.click(container.querySelector(
      ".command-palette-option-copy") as Element);

    expect(preview).toHaveBeenCalledWith(sequence.uuid);
    expect(dispatch).toHaveBeenCalledWith("preview-action");
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("filters and executes signed move actions", () => {
    const move = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Move X" } });
    const actions = () => Array.from(container.querySelectorAll(
      ".command-palette-option.selected button.command-palette-action"))
      .map(action => action.textContent);
    expect(actions()).toEqual([
      "-1000", "-100", "-10", "-1", "+1", "+10", "+100", "+1000",
    ]);
    expect(getByLabelText("Move X: Custom distance"))
      .toHaveClass("selected");
    fireEvent.change(search, { target: { value: "Move X +100" } });
    expect(actions()).toEqual(["+100"]);
    fireEvent.keyDown(search, { key: "Enter" });
    expect(move).toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
    expect(readRecentCommands()[0]).toEqual({
      id: "farmbot:move:x", actionId: "+100",
    });
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("executes a custom move distance from the unlabeled input", () => {
    const move = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Move Y" } });
    const custom = getByLabelText("Move Y: Custom distance");
    expect(custom).not.toHaveAttribute("placeholder");
    expect(custom.parentElement?.textContent)
      .not.toContain("Custom distance");
    fireEvent.keyDown(search, { key: "Enter" });
    expect(custom).toEqual(document.activeElement);
    search.focus();
    fireEvent.keyDown(search, { key: "ArrowRight" });
    fireEvent.keyDown(search, { key: "ArrowLeft" });
    expect(custom).toEqual(document.activeElement);
    search.focus();
    fireEvent.click(custom.closest(".command-palette-option") as Element);
    expect(custom).toEqual(document.activeElement);
    fireEvent.click(custom);
    fireEvent.keyDown(custom, { key: "Enter" });
    expect(container.textContent).toContain("Enter a valid number.");
    fireEvent.keyDown(custom, { key: "ArrowLeft" });
    expect(container.querySelector(
      ".command-palette-action.selected")?.textContent).toEqual("+1000");
    expect(search).toEqual(document.activeElement);
    fireEvent.focus(custom);
    fireEvent.change(custom, { target: { value: "-42.5" } });
    fireEvent.keyDown(custom, { key: "Enter" });
    expect(move).toHaveBeenCalledWith({ x: 0, y: -42.5, z: 0 });
    expect(readRecentCommands()[0]).toEqual({
      id: "farmbot:move:y",
      actionId: "custom",
      values: { yDistance: "-42.5" },
    });
    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(false);
  });

  it("shows multi-field actions inline", () => {
    const move = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, {
      target: { value: "Move to coordinates absolute location position" },
    });
    const x = getByLabelText("Move to coordinates: Move: X");
    const y = getByLabelText("Move to coordinates: Move: Y");
    const z = getByLabelText("Move to coordinates: Move: Z");
    expect(container.querySelector(
      ".command-palette-action-fields.command-palette-action-table"))
      .toBeTruthy();
    expect(x).not.toHaveClass("selected", "recent-execution");
    fireEvent.mouseMove(y);
    expect(y.closest("label")).toHaveClass("command-palette-axis-label");
    expect(y.closest("label")).not.toHaveClass("selected", "recent-execution");
    fireEvent.focus(x);
    expect(x.closest("label")).not.toHaveClass("selected", "recent-execution");
    fireEvent.keyDown(x, { key: "ArrowRight" });
    expect(y).toHaveFocus();
    fireEvent.keyDown(y, { key: "ArrowRight" });
    expect(z).toHaveFocus();
    fireEvent.keyDown(z, { key: "ArrowRight" });
    expect(x).toHaveFocus();
    fireEvent.keyDown(x, { key: "ArrowLeft" });
    expect(z).toHaveFocus();
    fireEvent.keyDown(x, { key: "Tab" });
    expect(y).toHaveFocus();
    fireEvent.keyDown(y, { key: "Tab" });
    expect(z).toHaveFocus();
    fireEvent.keyDown(z, { key: "Tab" });
    expect(x).toHaveFocus();
    fireEvent.keyDown(x, { key: "Tab", shiftKey: true });
    expect(z).toHaveFocus();
    fireEvent.change(x, { target: { value: "1" } });
    fireEvent.change(y, { target: { value: "2" } });
    fireEvent.change(z, { target: { value: "3" } });
    fireEvent.keyDown(z, { key: "Enter" });
    expect(move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
    expect(readRecentCommands()[0]).toEqual({
      id: "farmbot:move-to:coordinates",
      actionId: "move",
      values: { x: "1", y: "2", z: "3" },
    });
    const recent = setup();
    ["X", "Y", "Z"].map(axis => {
      const input = recent.getAllByLabelText(
        `Move to coordinates: Move: ${axis}`)[0];
      expect(input.closest("label"))
        .not.toHaveClass("selected", "recent-execution");
    });
  });

  it("uses Tab to traverse actions and command rows", () => {
    localStorage.setItem(COMMAND_PALETTE_RECENTS, JSON.stringify([
      { id: "farmbot:move:x" },
      { id: "farmbot:move:y" },
    ]));
    const { container, getAllByLabelText, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    const selectedAction = () => container.querySelector(
      ".command-palette-action.selected")?.textContent;
    const selectedCommand = () => container.querySelector(
      ".command-palette-option.selected strong")?.textContent;
    Array.from({ length: 8 }).map(() =>
      fireEvent.keyDown(search, { key: "Tab" }));
    expect(selectedAction()).toEqual("+1000");
    fireEvent.keyDown(search, { key: "Tab" });
    const customY = getAllByLabelText("Move Y: Custom distance")[0];
    expect(selectedCommand()).toEqual("Move Y");
    expect(customY).toEqual(document.activeElement);
    fireEvent.keyDown(customY, { key: "Tab", shiftKey: true });
    expect(selectedCommand()).toEqual("Move X");
    expect(selectedAction()).toEqual("+1000");
    expect(search).toEqual(document.activeElement);
  });

  it("renders and filters home command actions", () => {
    const { container, getByLabelText } = setup();
    const search = getByLabelText("Search commands");
    const actions = () => Array.from(container.querySelectorAll(
      ".command-palette-option.selected .command-palette-action"))
      .map(action => action.textContent);
    fireEvent.change(search, { target: { value: "Find home Y" } });
    expect(actions()).toEqual(["Y"]);
    expect(container.querySelector(".command-palette-option .fa-home"))
      .toBeTruthy();
    fireEvent.change(search, { target: { value: "Move home" } });
    expect(actions()).toEqual(["All", "X", "Y", "Z"]);
    expect(container.querySelector(".command-palette-option .fa-home"))
      .toBeTruthy();
    fireEvent.change(search, {
      target: { value: "Find axis length Z" },
    });
    expect(actions()).toEqual(["Z"]);
    expect(container.querySelector(".command-palette-option .fa-search"))
      .toBeTruthy();
    fireEvent.change(search, { target: { value: "Set home" } });
    expect(actions()).toEqual(["X", "Y", "Z"]);
    expect(container.querySelector(".command-palette-option .fa-home"))
      .toBeTruthy();
  });

  it("edits grouped numeric firmware axis settings in a table", () => {
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupFirmware();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, {
      target: { value: "Encoder Missed Steps Max" },
    });
    const table = container.querySelector(".command-palette-action-table");
    const prefix = "Settings > Encoders > Encoder Missed Steps Max";
    const x = getByLabelText(`${prefix}: X`);
    const y = getByLabelText(`${prefix}: Y`);
    const z = getByLabelText(`${prefix}: Z`);
    expect(table).toBeTruthy();
    expect([x, y, z].map(input => (input as HTMLInputElement).value))
      .toEqual(["5", "5", "5"]);
    expect(x).toHaveClass("selected");
    expect(x.closest("label")).not.toHaveClass("selected");
    expect(y).not.toHaveClass("selected");
    fireEvent.mouseMove(y);
    expect(y).toHaveClass("selected");
    expect(y.closest("label")).not.toHaveClass("selected");
    fireEvent.change(search, {
      target: { value: "Encoder Missed Steps Max Y" },
    });
    expect(container.querySelectorAll(".command-palette-action-input"))
      .toHaveLength(1);
    fireEvent.change(search, {
      target: { value: "Encoder Missed Steps Max" },
    });
    const selectedY = getByLabelText(`${prefix}: Y`);
    fireEvent.change(selectedY, { target: { value: "13" } });
    fireEvent.keyDown(selectedY, { key: "Enter" });
    expect(updateMCU).toHaveBeenCalledWith(
      "encoder_missed_steps_max_y", "13");
    expect(readRecentCommands()[0]).toEqual({
      id: "firmware-setting:encoder_missed_steps_max:set",
      actionId: "y",
      values: { y: "13" },
    });
    const recent = setupFirmware();
    const recentY = recent.getAllByLabelText(`${prefix}: Y`)[0];
    expect(recentY).toHaveValue(13);
    expect(recentY).toHaveClass("selected");
    expect(recentY).not.toHaveClass("recent-execution");
    expect(recentY.closest("label")).toHaveClass(
      "command-palette-axis-label", "recent-execution");
    expect(recentY.closest("label")).not.toHaveClass("selected");
    expect(recentY.closest("label"))
      .not.toHaveClass("command-palette-toggle-axis");
  });

  it("edits grouped boolean firmware axis settings in a table", () => {
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupFirmware();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Encoder Invert" } });
    const toggles = container.querySelectorAll(
      ".command-palette-action-table .fb-toggle-button");
    const axisLabels = container.querySelectorAll(
      ".command-palette-axis-label");
    expect(toggles).toHaveLength(3);
    expect(axisLabels).toHaveLength(3);
    expect(axisLabels[0]).toHaveClass(
      "selected", "command-palette-toggle-axis", "grid", "no-gap");
    expect(toggles[0].nextElementSibling).toHaveClass(
      "command-palette-toggle-selection-bar", "selected");
    expect(toggles[0]).toHaveClass("fb-button", "red");
    expect(toggles[0]).not.toHaveClass("command-palette-action");
    expect(toggles[0]).not.toHaveClass("command-palette-action-input");
    expect(toggles[0]).not.toHaveClass("selected");
    expect(toggles[0]).not.toHaveClass("recent-execution");
    expect(Array.from(toggles).map(toggle => toggle.textContent))
      .toEqual(["off", "off", "off"]);
    fireEvent.click(toggles[0]);
    expect(updateMCU).toHaveBeenCalledWith("encoder_invert_x", "1");
    expect(readRecentCommands()[0]).toEqual({
      id: "firmware-setting:encoder_invert:set",
      actionId: "x",
      values: { x: "1", y: "0", z: "0" },
    });
    const recent = setupFirmware();
    const recentLabel = recent.container.querySelector(
      ".command-palette-axis-label.recent-execution");
    const recentToggle = recentLabel?.querySelector(".fb-toggle-button");
    expect(Array.from(recent.container.querySelectorAll(
      ".command-palette-action-table .fb-toggle-button"))
      .slice(0, 3).map(toggle => toggle.textContent))
      .toEqual(["on", "off", "off"]);
    expect(recentLabel).toHaveClass(
      "selected", "command-palette-toggle-axis");
    expect(recentToggle?.nextElementSibling).toHaveClass(
      "command-palette-toggle-selection-bar", "selected");
    expect(recentLabel?.textContent).toContain("X");
    expect(recentToggle).not.toHaveClass("selected");
    expect(recentToggle).not.toHaveClass("recent-execution");
  });

  it("renders standalone boolean firmware settings as toggles", () => {
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupFirmware();
    fireEvent.change(getByLabelText("Search commands"), {
      target: { value: "Movement Secondary Motor X" },
    });
    const toggle = container.querySelector(
      ".command-palette-accessory .fb-toggle-button");

    expect(toggle).toHaveClass("fb-button", "green");
    expect(container.querySelector(".command-palette-action")).toBeFalsy();
    toggle && fireEvent.click(toggle);
    expect(updateMCU).toHaveBeenCalledWith("movement_secondary_motor_x", "0");
    expect(readRecentCommands()[0]).toEqual({
      id: "firmware-setting:movement_secondary_motor_x:set",
      values: { toggle: "0" },
    });
    const recent = setupFirmware();
    expect(recent.container.querySelector(
      ".command-palette-accessory .fb-toggle-button")?.textContent)
      .toEqual("off");
  });

  it("only completes successful command outcomes", async () => {
    const complete = jest.fn();
    completeCommandExecution(false, complete);
    completeCommandExecution(Promise.resolve(false), complete);
    completeCommandExecution(Promise.reject(new Error("cancelled")), complete);
    await act(() => Promise.resolve());
    expect(complete).not.toHaveBeenCalled();

    completeCommandExecution(undefined, complete);
    completeCommandExecution(Promise.resolve(true), complete);
    await act(() => Promise.resolve());
    expect(complete).toHaveBeenCalledTimes(2);
  });

  it("keeps rejected commands open and out of Recents", async () => {
    jest.spyOn(commandsModule, "buildCommands").mockReturnValue([{
      id: "rejecting-command",
      name: "Rejecting command",
      englishName: "Rejecting command",
      group: "navigation",
      execute: () => Promise.reject(new Error("cancelled")),
    }]);
    const { container, getByLabelText } = render(<MemoryRouter>
      <RawCommandPalette appState={fakeState()} dispatch={jest.fn()}
        initialOpen={true} />
    </MemoryRouter>);

    fireEvent.keyDown(getByLabelText("Search commands"), { key: "Enter" });
    await act(() => Promise.resolve());

    expect(container.querySelector("dialog")?.hasAttribute("open"))
      .toEqual(true);
    expect(readRecentCommandIds()).toEqual([]);
  });

  it("toggles the highlighted grid option when Enter executes it", () => {
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const { container, getByLabelText } = setupFirmware();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Encoder Invert" } });
    const toggles = container.querySelectorAll(
      ".command-palette-action-table .fb-toggle-button");
    fireEvent.keyDown(search, { key: "ArrowRight" });
    expect(document.activeElement).toEqual(toggles[1]);
    fireEvent.keyDown(toggles[1], { key: "Enter" });
    expect(updateMCU).toHaveBeenCalledWith("encoder_invert_y", "1");
    expect(readRecentCommands()[0]).toEqual({
      id: "firmware-setting:encoder_invert:set",
      actionId: "y",
      values: { x: "0", y: "1", z: "0" },
    });
  });

  it("toggles the selected grid option from the search field", () => {
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn() as never);
    const { getByLabelText } = setupFirmware();
    const search = getByLabelText("Search commands");
    fireEvent.change(search, { target: { value: "Encoder Invert" } });
    fireEvent.keyDown(search, { key: "Enter" });
    expect(updateMCU).toHaveBeenCalledWith("encoder_invert_x", "1");
    expect(readRecentCommands()[0]).toEqual({
      id: "firmware-setting:encoder_invert:set",
      actionId: "x",
      values: { x: "1", y: "0", z: "0" },
    });
  });

});
