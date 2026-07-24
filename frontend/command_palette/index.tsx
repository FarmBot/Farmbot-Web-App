import React from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router";
import { Everything } from "../interfaces";
import { buildCommands } from "./commands";
import {
  Command, CommandAction, CommandInputField, RecentCommandExecution,
} from "./interfaces";
import { searchCommands } from "./search";
import {
  clearRecentCommands, orderCommandsWithRecents, readRecentCommandIds,
  recordRecentCommand,
} from "./recents";
import { t } from "../i18next_wrapper";
import { Help, ToggleButton } from "../ui";

interface CommandPaletteProps {
  appState: Everything;
  dispatch: Function;
  initialOpen?: boolean;
}

export const COMMAND_PALETTE_OPEN_EVENT = "farmbot:open-command-palette";

export const openCommandPalette = () =>
  window.dispatchEvent(new Event(COMMAND_PALETTE_OPEN_EVENT));

export const commandPaletteShortcut = () =>
  navigator.platform.toLowerCase().includes("mac") ? "⌘K" : "Ctrl+K";

export const handleCommandPaletteHotkey = (
  open: boolean,
  close: () => void,
  show: () => void,
  event: KeyboardEvent,
) => {
  const modifier = event.metaKey || event.ctrlKey;
  const paletteKey = event.code == "KeyK"
    || (event.shiftKey && event.code == "KeyP");
  if (!modifier || !paletteKey) { return; }
  event.preventDefault();
  event.stopPropagation();
  if (open) {
    close();
  } else {
    show();
  }
};

export const showCommandPalette = (
  setQuery: (value: string) => void,
  setSelected: (value: number) => void,
  setSelectedAction: (value: number) => void,
  setValidationError: (value: undefined) => void,
  setOpen: (value: boolean) => void,
) => {
  setQuery("");
  setSelected(0);
  setSelectedAction(0);
  setValidationError(undefined);
  setOpen(true);
};

export const completeCommandExecution = (
  result: unknown,
  complete: () => void,
) => {
  if (result === false) { return; }
  const promise = result as PromiseLike<unknown> | undefined;
  if (typeof promise?.then == "function") {
    void Promise.resolve(promise)
      .then(value => value !== false && complete())
      .catch(() => { });
    return;
  }
  complete();
};

const commandInstanceId = (command: Command) =>
  command.instanceId || command.id;

const actionValueKey = (
  command: Command,
  action: CommandAction,
  fieldKey: string,
) => `${commandInstanceId(command)}:${action.id}:${fieldKey}`;

const actionInputValues = (
  command: Command,
  action: CommandAction,
  current: Record<string, string>,
) => {
  return Object.fromEntries((action.input?.fields || []).map(field => [
    field.key,
    current[actionValueKey(command, action, field.key)]
      ?? (command.recentExecution?.actionId == action.id
        || field.type == "boolean"
        ? command.recentExecution?.values?.[field.key]
        : undefined)
      ?? field.initialValue
      ?? "",
  ]));
};

const actionInputId = (
  command: Command,
  action: CommandAction,
  fieldKey: string,
) => [
  "command-palette-action-input",
  commandInstanceId(command),
  action.id,
  fieldKey,
].join("-");

const stateClassName = (
  base: string[],
  selected: boolean,
  recent: boolean,
) => [
  ...base,
  selected ? "selected" : "",
  recent ? "recent-execution" : "",
].join(" ");

const actionInputClassName = (
  toggle: boolean,
  selected: boolean,
  recent: boolean,
) => toggle
  ? undefined
  : stateClassName([
    "command-palette-action",
    "command-palette-action-input",
  ], selected, recent);

const axisLabelClassName = (
  axisLabel: boolean,
  selected: boolean,
  recent: boolean,
) => axisLabel
  ? stateClassName(["command-palette-axis-label"], selected, recent)
  : undefined;

const actionFieldLabelClassName = (
  axisLabel: boolean,
  toggle: boolean,
  selected: boolean,
  recent: boolean,
) => [
  axisLabelClassName(axisLabel, selected, recent),
  axisLabel && toggle ? "command-palette-toggle-axis grid no-gap" : "",
].filter(Boolean).join(" ") || undefined;

const ToggleSelectionBar = ({
  show,
  selected,
}: {
  show: boolean;
  selected: boolean;
}) => show
  ? <div className={[
    "command-palette-toggle-selection-bar",
    selected ? "selected" : "",
  ].join(" ")} />
  : undefined;

const inputRecentExecution = (
  axisLabel: boolean,
  customMoveInput: boolean,
  recentExecution: boolean,
) => axisLabel || customMoveInput ? false : recentExecution;

const actionFieldSelection = (
  actionSelected: boolean,
  actionTable: boolean,
  axisLabel: boolean,
  toggle: boolean,
) => ({
  axisLabelSelected: actionTable && actionSelected && toggle,
  inputSelected: actionSelected
    && (!axisLabel || (actionTable && !toggle)),
});

const CustomMoveRecentDot = ({
  show,
  recent,
}: {
  show: boolean;
  recent: boolean;
}) => show
  ? <div
    className={[
      "command-palette-action-recent-dot",
      "command-palette-custom-move-dot",
      recent ? "recent-execution" : "",
    ].join(" ")}
    aria-hidden={true} />
  : undefined;

interface ActionValueInputProps {
  field: CommandInputField;
  id: string;
  className: string | undefined;
  value: string;
  ariaLabel: string;
  disabled: boolean;
  onFocus(): void;
  onChange(value: string): void;
}

const ActionValueInput = (props: ActionValueInputProps) => {
  if (props.field.options) {
    const currentOptionAvailable = props.field.options.some(
      option => option.value == props.value);
    return <select
      id={props.id}
      className={props.className}
      data-has-options={true}
      value={props.value}
      aria-label={props.ariaLabel}
      disabled={props.disabled}
      onFocus={props.onFocus}
      onClick={event => event.stopPropagation()}
      onChange={event => props.onChange(event.currentTarget.value)}>
      {!currentOptionAvailable &&
        <option value={props.value} disabled={true}>
          {props.value || t("Select an option")}
        </option>}
      {props.field.options.map(option =>
        <option key={option.value} value={option.value}>
          {option.label}
        </option>)}
    </select>;
  }
  return <input
    id={props.id}
    type={props.field.type || "text"}
    className={props.className}
    value={props.value}
    placeholder={props.field.placeholder}
    min={props.field.min}
    max={props.field.max}
    step={props.field.step}
    aria-label={props.ariaLabel}
    disabled={props.disabled}
    onFocus={props.onFocus}
    onClick={event => event.stopPropagation()}
    onChange={event => props.onChange(event.currentTarget.value)} />;
};

const validActionIndex = (actions: CommandAction[], index: number) =>
  index >= 0 && index < actions.length;

const isCustomMoveInput = (command: Command, action: CommandAction) =>
  action.id == "custom" && [
    "farmbot:move:x",
    "farmbot:move:y",
    "farmbot:move:z",
  ].includes(command.id);

const defaultActionIndex = (command?: Command) => {
  const actionId = command?.recentExecution?.actionId;
  const index = command?.actions?.findIndex(action => action.id == actionId);
  return index !== undefined && index >= 0 ? index : 0;
};

export const defaultCommandActionName = (command: Command) => {
  if (command.id == "panel") { return t("Close Panel"); }
  if (command.id == "panel:map") { return t("Show Map"); }
  if (command.id.startsWith("panel:")) { return t("Open Panel"); }
  if (command.id.startsWith("settings-section:")) {
    return t("Open Section");
  }
  if (command.id.startsWith("settings-item:")) { return t("Open Setting"); }
  return t("Execute");
};

const CommandIcon = ({ command }: { command: Command }) => {
  if (command.imageIcon) {
    const className = [
      command.themeAwareImageIcon ? "theme-aware-icon" : "",
      command.imageIconClass || "",
    ].join(" ").trim() || undefined;
    return <img src={command.imageIcon} alt="" className={className} />;
  }
  if (command.iconStack) {
    return <span className="fa-stack command-palette-icon-stack">
      <i className={`fa fa-${command.iconStack.base} fa-stack-2x`} />
      <i className={`fa fa-${command.iconStack.overlay} fa-stack-1x`} />
    </span>;
  }
  return <i className={`fa fa-${command.icon || "terminal"}`} />;
};

const CommandTitle = ({ command }: { command: Command }) =>
  <div className="command-palette-option-title">
    <strong>{command.name}</strong>
    {command.help &&
      <span
        className="command-palette-help-container"
        onClick={event => event.stopPropagation()}
        onKeyDown={event =>
          event.key != "Tab" && event.stopPropagation()}>
        <Help
          text={command.help.text}
          enableMarkdown={command.help.enableMarkdown}
          usePortal={false}
          focusable={true}
          customClass="command-palette-help"
          ariaLabel={t("Help for {{name}}", { name: command.name })} />
      </span>}
  </div>;

export const RawCommandPalette = (props: CommandPaletteProps) => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-null/no-null
  const dialogRef = React.useRef<HTMLDialogElement>(null);
  // eslint-disable-next-line no-null/no-null
  const searchRef = React.useRef<HTMLInputElement>(null);
  const actionInputRefs = React.useRef(new Map<string, HTMLElement>());
  const initializedOpen = React.useRef(false);
  const executionSession = React.useRef(0);
  const [open, setOpen] = React.useState(!!props.initialOpen);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(0);
  const [selectedAction, setSelectedAction] = React.useState(0);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [validationError, setValidationError] = React.useState<string>();
  const [, setRecentVersion] = React.useState(0);
  const commands = React.useMemo(() => open
    ? buildCommands({
      state: props.appState,
      dispatch: props.dispatch,
      navigate,
    })
    : [], [open, props.appState, props.dispatch, navigate]);
  const recentIds = open ? readRecentCommandIds() : [];
  const results = query
    ? searchCommands(commands, query)
    : orderCommandsWithRecents(commands);
  const recentCount = query
    ? 0
    : recentIds
      .filter(id => results.some(command => command.id == id)).length;
  const resetClosedState = React.useCallback(() => {
    executionSession.current++;
    setValues({});
    setValidationError(undefined);
    setOpen(false);
  }, []);
  const close = React.useCallback(() => {
    dialogRef.current?.close();
    resetClosedState();
  }, [resetClosedState]);
  const clearRecents = React.useCallback(() => {
    clearRecentCommands();
    setRecentVersion(version => version + 1);
    setSelected(0);
    searchRef.current?.focus();
  }, []);

  const show = React.useMemo(() => showCommandPalette.bind(
    undefined,
    setQuery,
    setSelected,
    setSelectedAction,
    setValidationError,
    setOpen,
  ), []);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) {
      dialog.showModal();
      searchRef.current?.focus();
    }
  }, [open]);

  React.useEffect(() => {
    const hotkey = handleCommandPaletteHotkey.bind(
      undefined, open, close, show);
    window.addEventListener("keydown", hotkey, true);
    return () => window.removeEventListener("keydown", hotkey, true);
  }, [close, open, show]);

  React.useEffect(() => {
    const openPalette = () => show();
    window.addEventListener(COMMAND_PALETTE_OPEN_EVENT, openPalette);
    return () =>
      window.removeEventListener(COMMAND_PALETTE_OPEN_EVENT, openPalette);
  }, [show]);

  React.useEffect(() => {
    const active = document.getElementById(`command-palette-option-${selected}`);
    active?.scrollIntoView?.({ block: "nearest" });
  }, [selected]);

  React.useLayoutEffect(() => {
    if (!open) {
      initializedOpen.current = false;
      return;
    }
    if (initializedOpen.current || !commands.length) { return; }
    initializedOpen.current = true;
    const command = orderCommandsWithRecents(commands)[0];
    setSelectedAction(defaultActionIndex(command));
  }, [commands, open]);

  const focusActionInput = (
    command?: Command,
    action?: CommandAction,
    lastField = false,
  ) => {
    const fields = action?.input?.fields || [];
    const field = fields[lastField ? fields.length - 1 : 0];
    if (!command || !action || !field) { return false; }
    actionInputRefs.current.get(
      actionInputId(command, action, field.key))?.focus();
    return true;
  };

  const focusActionOrSearch = (
    command?: Command,
    action?: CommandAction,
    lastField = false,
  ) => {
    if (!focusActionInput(command, action, lastField)) {
      searchRef.current?.focus();
    }
  };

  const finishExecution = (
    command: Command,
    result: unknown,
    recent?: RecentCommandExecution,
  ) => {
    const session = executionSession.current;
    completeCommandExecution(result, () => {
      command.recordRecent !== false
        && recordRecentCommand(command.id, recent?.actionId, recent?.values);
      session == executionSession.current && close();
    });
  };

  const executeAction = (
    command: Command,
    action: CommandAction,
    overrides: Record<string, string> = {},
  ) => {
    const inputValues = {
      ...actionInputValues(command, action, values),
      ...overrides,
    };
    const error = action.input?.validate?.(inputValues);
    if (error) {
      setValidationError(error);
      return;
    }
    finishExecution(command,
      action.execute(action.input ? inputValues : undefined), {
        actionId: action.id,
        ...(action.input ? { values: inputValues } : {}),
      });
  };

  const executeBooleanAction = (
    command: Command,
    action: CommandAction,
    fieldKey: string,
  ) => {
    if (command.unavailable || action.unavailable) { return; }
    const key = actionValueKey(command, action, fieldKey);
    const inputValues = actionInputValues(command, action, values);
    const toggledValue = inputValues[fieldKey] == "1" ? "0" : "1";
    const value = values[key] === undefined
      ? toggledValue
      : inputValues[fieldKey];
    const toggleValues = Object.fromEntries(
      (command.actions || []).flatMap(item =>
        (item.input?.fields || []).flatMap(field => field.type == "boolean"
          ? [[field.key, actionInputValues(command, item, values)[field.key]]]
          : [])));
    executeAction(command, action, {
      ...toggleValues,
      [fieldKey]: value,
    });
  };

  const execute = (command: Command, action?: CommandAction) => {
    if (command.unavailable || action?.unavailable) { return; }
    if (action) {
      executeAction(command, action);
      return;
    }
    const recent = command.toggleValue === undefined
      ? undefined
      : { values: { toggle: command.toggleValue ? "0" : "1" } };
    finishExecution(command, command.execute(), recent);
  };

  const activateAction = (command: Command, action: CommandAction) => {
    if (!action.input) {
      execute(command, action);
      return;
    }
    const booleanField = action.input.fields.find(
      field => field.type == "boolean");
    if (booleanField) {
      executeBooleanAction(command, action, booleanField.key);
      return;
    }
    setValidationError(undefined);
    focusActionInput(command, action);
  };

  const moveSelection = (offset: number) => {
    if (!results.length) { return; }
    if (offset < 0 && selected == 0) {
      setSelected(-1);
      setSelectedAction(0);
      searchRef.current?.focus();
      return;
    }
    if (offset < 0 && selected < 0 && !query) {
      searchRef.current?.focus();
      return;
    }
    let next = (selected + offset + results.length) % results.length;
    if (selected < 0) {
      next = offset > 0 ? 0 : results.length - 1;
    }
    const actionIndex = defaultActionIndex(results[next]);
    setSelectedAction(actionIndex);
    setSelected(next);
    focusActionOrSearch(results[next], results[next]?.actions?.[actionIndex]);
  };

  const moveActionSelection = (offset: number, fromActionInput = false) => {
    const command = results[selected];
    const actionCount = command?.actions?.length || 0;
    if (!actionCount || (fromActionInput && actionCount == 1)) { return false; }
    const next = (selectedAction + offset + actionCount) % actionCount;
    setSelectedAction(next);
    focusActionOrSearch(command, command.actions?.[next]);
    return true;
  };

  const moveTabSelection = (offset: -1 | 1) => {
    if (!results.length) { return; }
    const command = results[selected];
    const actions = command?.actions || [];
    const nextAction = selectedAction + offset;
    if (validActionIndex(actions, nextAction)) {
      setSelectedAction(nextAction);
      focusActionOrSearch(command, actions[nextAction], offset < 0);
      return;
    }
    const next = (selected + offset + results.length) % results.length;
    const nextCommand = results[next];
    const nextActions = nextCommand?.actions || [];
    const actionIndex = offset > 0 ? 0 : Math.max(0, nextActions.length - 1);
    setSelected(next);
    setSelectedAction(actionIndex);
    focusActionOrSearch(nextCommand, nextActions[actionIndex], offset < 0);
  };

  const focusSelectedHelp = () => {
    const selectedOption =
      document.getElementById(`command-palette-option-${selected}`);
    const help = selectedOption instanceof Element
      ? selectedOption.querySelector<HTMLElement>(
        ".command-palette-help-container [role='button']")
      : undefined;
    help?.focus();
    return !!help;
  };

  const onActionFieldKeyDown = (
    event: React.KeyboardEvent,
    command: Command,
    action: CommandAction,
    fields: CommandInputField[],
    field: CommandInputField,
    fieldIndex: number,
  ) => {
    const horizontal = event.key == "ArrowLeft" || event.key == "ArrowRight";
    if (horizontal && fields.length > 1 && !field.options) {
      event.stopPropagation();
      event.preventDefault();
      const offset = event.key == "ArrowRight" ? 1 : -1;
      const nextIndex = (fieldIndex + offset + fields.length) % fields.length;
      const nextField = fields[nextIndex];
      actionInputRefs.current.get(actionInputId(
        command, action, nextField.key))?.focus();
      return;
    }
    if (event.key == "Tab" && fields.length > 1) {
      event.stopPropagation();
      event.preventDefault();
      const offset = event.shiftKey ? -1 : 1;
      const nextField = fields[fieldIndex + offset];
      if (nextField) {
        actionInputRefs.current.get(actionInputId(
          command, action, nextField.key))?.focus();
      } else {
        moveTabSelection(offset);
      }
      return;
    }
    if (event.key != "Enter") { return; }
    event.stopPropagation();
    event.preventDefault();
    if (field.type == "boolean") {
      executeBooleanAction(command, action, field.key);
    } else {
      execute(command, action);
    }
  };

  // eslint-disable-next-line complexity
  const onKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();
    const target = event.target as HTMLElement;
    const nativeSelect = target.tagName == "SELECT";
    const helpTrigger = !!target.closest(".command-palette-help-container");
    if (event.key == "Tab") {
      event.preventDefault();
      if (helpTrigger) {
        if (event.shiftKey) {
          const command = results[selected];
          focusActionOrSearch(
            command, command?.actions?.[selectedAction], true);
        } else {
          moveTabSelection(1);
        }
      } else if (event.shiftKey || !focusSelectedHelp()) {
        moveTabSelection(event.shiftKey ? -1 : 1);
      }
    } else if (!nativeSelect && event.key == "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    } else if (!nativeSelect && event.key == "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    } else if (!nativeSelect
      && (event.key == "ArrowLeft" || event.key == "ArrowRight")
      && moveActionSelection(
        event.key == "ArrowRight" ? 1 : -1,
        (event.target as HTMLElement)
          .classList.contains("command-palette-action-input"),
      )) {
      event.preventDefault();
    } else if (event.key == "Enter") {
      event.preventDefault();
      const command = results[selected];
      const action = command?.actions?.[selectedAction];
      if (command && action) {
        activateAction(command, action);
      } else if (command) {
        execute(command);
      }
    }
  };

  const renderAction = (
    command: Command,
    commandIndex: number,
    active: boolean,
    action: CommandAction,
    actionIndex: number,
  ) => {
    const actionSelected = active && selectedAction == actionIndex;
    const recentExecution = command.recentExecution?.actionId == action.id;
    if (!action.input) {
      const selectAction = () => {
        setSelected(commandIndex);
        setSelectedAction(actionIndex);
      };
      const className = [
        "command-palette-action",
        actionSelected ? "selected" : "",
      ].join(" ");
      return <div key={action.id}
        className="command-palette-action-option"
        onMouseMove={event => {
          event.stopPropagation();
          selectAction();
        }}>
        <span
          className={[
            "command-palette-action-recent-dot",
            recentExecution ? "recent-execution" : "",
          ].join(" ")}
          aria-hidden={true} />
        {action.href
          ? <a
            href={action.href}
            target="_blank"
            rel="noreferrer"
            tabIndex={-1}
            className={className}
            aria-label={`${command.name}: ${action.name}`}
            title={action.unavailable}
            onMouseMove={event => {
              event.stopPropagation();
              selectAction();
            }}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              selectAction();
              execute(command, action);
            }}>
            {action.name}
          </a>
          : <button
            type="button"
            tabIndex={-1}
            className={className}
            aria-label={`${command.name}: ${action.name}`}
            disabled={!!(command.unavailable || action.unavailable)}
            title={action.unavailable}
            onMouseMove={event => {
              event.stopPropagation();
              selectAction();
            }}
            onClick={event => {
              event.stopPropagation();
              selectAction();
              execute(command, action);
            }}>
            {action.name}
          </button>}
      </div>;
    }
    const inputValues = actionInputValues(command, action, values);
    const fields = action.input.fields;
    const showLabels = command.actionTable || fields.length > 1;
    const customMoveInput = isCustomMoveInput(command, action);
    return <div key={action.id}
      className={[
        "command-palette-action-fields",
        action.input.table ? "command-palette-action-table" : "",
      ].join(" ")}>
      {fields.map((field, fieldIndex) => {
        const id = actionInputId(command, action, field.key);
        const toggle = field.type == "boolean";
        const axisLabel = !!command.actionTable || !!action.input?.table;
        const { axisLabelSelected, inputSelected } = actionFieldSelection(
          actionSelected, !!command.actionTable, axisLabel, toggle);
        const axisLabelRecent = !!command.actionTable && recentExecution;
        const className = actionInputClassName(
          toggle,
          inputSelected,
          inputRecentExecution(
            axisLabel, customMoveInput, recentExecution),
        );
        return <label key={field.key}
          className={actionFieldLabelClassName(
            axisLabel, toggle, axisLabelSelected, axisLabelRecent)}
          ref={element => {
            const input = element?.querySelector<HTMLElement>(
              "input, button, select");
            if (input) {
              actionInputRefs.current.set(id, input);
            } else {
              actionInputRefs.current.delete(id);
            }
          }}
          onMouseMove={event => {
            event.stopPropagation();
            setSelected(commandIndex);
            setSelectedAction(actionIndex);
          }}
          onKeyDown={event => onActionFieldKeyDown(
            event, command, action, fields, field, fieldIndex)}>
          {showLabels && <span>{field.label}</span>}
          <CustomMoveRecentDot
            show={customMoveInput}
            recent={recentExecution} />
          {field.type == "boolean"
            ? <>
              <ToggleButton
                className={className}
                toggleValue={inputValues[field.key]}
                disabled={!!(command.unavailable || action.unavailable)}
                customText={{ textFalse: t("off"), textTrue: t("on") }}
                toggleAction={event => {
                  event.stopPropagation();
                  setSelected(commandIndex);
                  setSelectedAction(actionIndex);
                  setValidationError(undefined);
                  executeBooleanAction(command, action, field.key);
                }} />
              <ToggleSelectionBar
                show={axisLabel}
                selected={axisLabelSelected} />
            </>
            : <ActionValueInput
              field={field}
              id={id}
              className={className}
              value={inputValues[field.key]}
              ariaLabel={[
                command.name,
                action.name,
                fields.length > 1 ? field.label : undefined,
              ].filter(Boolean).join(": ")}
              disabled={!!(command.unavailable || action.unavailable)}
              onFocus={() => {
                setSelected(commandIndex);
                setSelectedAction(actionIndex);
              }}
              onChange={value => {
                setValidationError(undefined);
                if (field.options) {
                  executeAction(command, action, { [field.key]: value });
                  return;
                }
                setValues(current => ({
                  ...current,
                  [actionValueKey(command, action, field.key)]: value,
                }));
              }} />}
        </label>;
      })}
    </div>;
  };

  const renderDefaultAction = (
    command: Command,
    commandIndex: number,
    active: boolean,
  ) => {
    const actionName = defaultCommandActionName(command);
    return <div
      className={[
        "command-palette-actions",
        "command-palette-default-actions",
      ].join(" ")}>
      <button
        type="button"
        tabIndex={-1}
        className={[
          "command-palette-action",
          active ? "selected" : "",
        ].join(" ")}
        aria-label={`${command.name}: ${actionName}`}
        disabled={!!command.unavailable}
        title={command.unavailable}
        onMouseMove={event => {
          event.stopPropagation();
          setSelected(commandIndex);
          setSelectedAction(0);
        }}
        onClick={event => {
          event.stopPropagation();
          setSelected(commandIndex);
          setSelectedAction(0);
          execute(command);
        }}>
        {actionName}
      </button>
    </div>;
  };

  return <dialog
    ref={dialogRef}
    className="command-palette-dialog"
    aria-label={t("Command palette")}
    onKeyDown={onKeyDown}
    onClick={event => {
      if (event.target == event.currentTarget) { close(); }
    }}
    onClose={resetClosedState}>
    {open && <><div className="command-palette-header row no-gap">
      <i className="fa fa-search" aria-hidden={true} />
      <input
        ref={searchRef}
        className={[
          "command-palette-search",
          selected < 0 ? "selected" : "",
        ].join(" ")}
        value={query}
        placeholder={t("Search commands, settings, and navigations...")}
        aria-label={t("Search commands")}
        aria-controls="command-palette-list"
        aria-activedescendant={selected < 0
          ? undefined
          : `command-palette-option-${selected}`}
        onChange={event => {
          setQuery(event.currentTarget.value);
          setSelected(0);
          setSelectedAction(0);
        }} />
      <span className="command-palette-hotkeys">
        {t("Esc")}
      </span>
      <button
        type="button"
        className="fb-icon-button command-palette-close"
        title={t("Close command palette")}
        aria-label={t("Close command palette")}
        onClick={close}>
        <i className="fa fa-times" aria-hidden={true} />
      </button>
    </div>
    <div id="command-palette-list"
      className="command-palette-list"
      role="listbox"
      aria-label={t("Commands")}>
      {!results.length && <p className="command-palette-empty">
        {t("No commands found")}
      </p>}
      {/* eslint-disable-next-line complexity, react-hooks/refs */}
      {results.map((command, index) => {
        const active = selected == index;
        return <React.Fragment key={commandInstanceId(command)}>
          {index == 0 && recentCount > 0 &&
            <div className={"command-palette-group-header"}>
              <p className="command-palette-group-label">{t("Recent")}</p>
              <button
                type={"button"}
                className={"fb-button gray command-palette-clear-recents"}
                onClick={event => {
                  event.stopPropagation();
                  clearRecents();
                }}>
                {t("Clear")}
              </button>
            </div>}
          {index == recentCount && recentCount > 0 &&
            <p className={[
              "command-palette-group-label",
              "command-palette-all-commands-label",
            ].join(" ")}>
              {t("All commands")}
            </p>}
          <div
            id={`command-palette-option-${index}`}
            className={[
              "command-palette-option",
              `command-palette-${command.group}-command`,
              command.id.startsWith("settings-section:")
                ? "command-palette-settings-section-command"
                : "",
              command.id == "recents:clear"
                ? "command-palette-title-case-command"
                : "",
              active ? "selected" : "",
              command.actions?.length ? "multi-action" : "",
              command.unavailable ? "disabled" : "",
            ].join(" ")}
            role="option"
            aria-selected={active}
            aria-disabled={!!command.unavailable}
            onMouseMove={() => {
              if (!active) {
                setSelected(index);
                setSelectedAction(defaultActionIndex(command));
              }
            }}>
            <div className="command-palette-option-icon">
              <CommandIcon command={command} />
            </div>
            <div className="command-palette-option-copy">
              <CommandTitle command={command} />
              {command.unavailable && <span className="command-palette-unavailable">
                {command.unavailable}
              </span>}
            </div>
            {!!command.actions?.length && <div
              className={[
                "command-palette-actions",
                command.actionTable ? "command-palette-action-table" : "",
              ].join(" ")}>
              {command.actions.map((action, actionIndex) =>
                renderAction(command, index, active, action, actionIndex))}
              {active && command.actions[selectedAction]?.input
                && validationError && <p className="command-palette-error">
                {validationError}
              </p>}
            </div>}
            {!command.actions?.length && !command.accessory
              && renderDefaultAction(command, index, active)}
            {command.accessory && <div className="command-palette-accessory">
              {command.accessory(
                () => execute(command),
                command.recentExecution?.values?.toggle === undefined
                  ? undefined
                  : command.recentExecution.values.toggle == "1")}
            </div>}
          </div>
        </React.Fragment>;
      })}
    </div>
    <div className="command-palette-footer row grid-exp-2">
      <span>
        <kbd>↑</kbd><kbd>↓</kbd> {t("Navigate")}
        {!!results[selected]?.actions?.length && <>
          {" "}<kbd>←</kbd><kbd>→</kbd> {t("Actions")}
        </>}
      </span>
      <span><kbd>↵</kbd> {t("Execute")}</span>
    </div>
    </>}
  </dialog>;
};

export const mapStateToCommandPaletteProps = (appState: Everything) => ({
  appState,
});

export const commandPaletteStateEqual = (
  next: Everything,
  previous: Everything,
) => {
  const nextInfo = next.bot.hardware.informational_settings;
  const previousInfo = previous.bot.hardware.informational_settings;
  return next.app === previous.app
    && next.resources.index === previous.resources.index
    && next.resources.consumers.farm_designer
      === previous.resources.consumers.farm_designer
    && next.bot.hardware.configuration
      === previous.bot.hardware.configuration
    && next.bot.hardware.mcu_params
      === previous.bot.hardware.mcu_params
    && next.bot.hardware.location_data
      === previous.bot.hardware.location_data
    && next.bot.hardware.pins === previous.bot.hardware.pins
    && nextInfo.busy === previousInfo.busy
    && nextInfo.locked === previousInfo.locked
    && nextInfo.sync_status === previousInfo.sync_status
    && next.bot.connectivity.uptime["bot.mqtt"]
      === previous.bot.connectivity.uptime["bot.mqtt"];
};

export const CommandPalette = connect(
  mapStateToCommandPaletteProps,
  undefined,
  undefined,
  { areStatesEqual: commandPaletteStateEqual },
)(RawCommandPalette);
