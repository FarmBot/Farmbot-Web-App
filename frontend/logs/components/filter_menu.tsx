import React from "react";
import { LogsFilterMenuProps, LogsState, Filters } from "../interfaces";
import { Slider } from "@blueprintjs/core";
import { startCase } from "lodash";
import { MESSAGE_TYPES, MessageType } from "../../sequences/interfaces";
import { t } from "../../i18next_wrapper";
import {
  getModifiedClassName, getModifiedClassNameDefaultFalse,
  getModifiedClassNameSpecifyModified,
} from "../../settings/default_values";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";

const MENU_ORDER: string[] = [
  MessageType.success,
  MessageType.busy,
  MessageType.warn,
  MessageType.error,
  MessageType.info,
  MessageType.fun,
  MessageType.debug,
  MessageType.assertion,
];

const REVERSE_MENU_ORDER = MENU_ORDER.slice().reverse();

/** Order the log filter sort menu, adding unknown types last. */
const menuSort = (a: string, b: string) =>
  REVERSE_MENU_ORDER.indexOf(b) - REVERSE_MENU_ORDER.indexOf(a);

export const NON_FILTER_SETTINGS = [
  "autoscroll", "markdown", "searchTerm", "currentFbosOnly",
];

/** Get log filter keys from LogsState. */
export const filterStateKeys = (state: LogsState) =>
  Object.keys(state).filter(key => !NON_FILTER_SETTINGS.includes(key));

export const LogsFilterMenu = (props: LogsFilterMenuProps) => {
  /** Filter level 0: logs hidden. */
  const btnColor = (x: keyof Filters) => props.state[x] != 0
    ? "green"
    : "red";
  /** Set the filter level to the same value for all log message types. */
  const setAll = (level: number) => () => {
    MESSAGE_TYPES.map((x: keyof Filters) => props.setFilterLevel(x)(level));
  };
  return <div className={"logs-settings-menu"}>
    <fieldset>
      <label>
        {t("Presets")}
      </label>
      <button className={"fb-button gray"}
        title={t("show all")}
        onClick={setAll(3)}>
        {t("max")}
      </button>
      <button className={"fb-button gray"}
        title={t("default")}
        onClick={setAll(1)}>
        {t("normal")}
      </button>
    </fieldset>
    {filterStateKeys(props.state).sort(menuSort)
      .map((logType: keyof Filters) =>
        <fieldset key={logType}>
          <label>
            <div className={`saucer ${logType}`} />
            {t(startCase(logType))}
          </label>
          <button
            className={[
              "fb-button fb-toggle-button " + btnColor(logType),
              getModifiedClassNameDefaultFalse(props.state[logType] == 0),
            ].join(" ")}
            title={t("toggle logs")}
            onClick={props.toggle(logType)}>
            {props.state[logType] > 0 ? t("on") : t("off")}
          </button>
          <Slider min={0} max={3} stepSize={1}
            className={getModifiedClassName(logType + "_log" as keyof WebAppConfig)}
            onChange={props.setFilterLevel(logType)}
            value={props.state[logType]} />
        </fieldset>)}
    <fieldset>
      <label>
        {t("Current version only")}
      </label>
      <button
        className={[
          "fb-button fb-toggle-button",
          props.state.currentFbosOnly ? "green" : "red",
          getModifiedClassNameSpecifyModified(props.state.currentFbosOnly),
        ].join(" ")}
        title={t("Only show logs sent from current FarmBot OS version.")}
        onClick={props.toggleCurrentFbosOnly}>
        {props.state.currentFbosOnly ? t("yes") : t("no")}
      </button>
    </fieldset>
  </div>;
};
