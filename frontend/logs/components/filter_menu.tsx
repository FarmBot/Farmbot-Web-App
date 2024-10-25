import React from "react";
import { LogsFilterMenuProps, LogsState, Filters } from "../interfaces";
import { Slider } from "@blueprintjs/core";
import { mean, range, round, startCase } from "lodash";
import { MESSAGE_TYPES, MessageType } from "../../sequences/interfaces";
import { t } from "../../i18next_wrapper";
import {
  getModifiedClassName,
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
  /** Set the filter level to the same value for all log message types. */
  const setAll = (level: number) => () => {
    MESSAGE_TYPES.map((x: keyof Filters) => props.setFilterLevel(x)(level));
  };
  const values = filterStateKeys(props.state)
    .map((key: keyof LogsState) => props.state[key]);
  const [value, setValue] = React.useState(round(mean(values)));
  return <div className={"logs-filter-menu grid"}>
    <div className={"lines"}>
      {range(0, 4).map(i =>
        <div key={i} className={"line"}
          style={{ left: `${12.5 + i * 5}rem` }}>
          <div className={"line-label"}>{i}</div>
        </div>)}
    </div>
    <fieldset className="row log-filters-grid">
      <label className="row grid-exp-2 half-gap">
        <div className={"saucer"} style={{
          background: "white",
          border: "2px black solid",
        }} />
        {t("All")}
      </label>
      <Slider min={0} max={3} stepSize={1} labelRenderer={false}
        onChange={val => setValue(val)}
        onRelease={val => setAll(val)()}
        value={value} />
    </fieldset>
    {filterStateKeys(props.state).sort(menuSort)
      .map((logType: keyof Filters) =>
        <fieldset key={logType} className="row log-filters-grid">
          <label className="row grid-exp-2 half-gap">
            <div className={`saucer ${logType}`} />
            {t(startCase(logType))}
          </label>
          <Slider min={0} max={3} stepSize={1} labelRenderer={false}
            className={getModifiedClassName(logType + "_log" as keyof WebAppConfig)}
            onChange={props.setFilterLevel(logType)}
            value={props.state[logType]} />
        </fieldset>)}
    <fieldset className="row grid-exp-1">
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
