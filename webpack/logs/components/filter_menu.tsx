import * as React from "react";
import { LogsFilterMenuProps, LogsState } from "../interfaces";
import * as _ from "lodash";
import { Slider } from "@blueprintjs/core";
import { t } from "i18next";
import { Filters } from "../interfaces";

export const LogsFilterMenu = (props: LogsFilterMenuProps) => {
  const btnColor = (x: keyof LogsState) => props.state[x] != 0
    ? "green" : "red";
  const setAll = (level: number) => () => {
    ["success", "busy", "warn", "error", "info", "fun", "debug"]
      .map((x: keyof Filters) => props.setFilterLevel(x)(level));
  };
  return <div className={"logs-settings-menu"}>
    <fieldset>
      <label>
        {t("Presets:")}
      </label>
      <button className={`fb-button gray`} onClick={setAll(3)}>
        {t("max")}
      </button>
      <button className={`fb-button gray`} onClick={setAll(1)}>
        {t("normal")}
      </button>
    </fieldset>
    {Object.keys(props.state)
      .filter(x => { if (!(x == "autoscroll")) { return x; } })
      .map((logType: keyof LogsState) => {
        return <fieldset key={logType}>
          <label>
            <div className={`saucer ${logType}`} />
            {t(_.startCase(logType))}
          </label>
          <button
            className={"fb-button fb-toggle-button " + btnColor(logType)}
            onClick={props.toggle(logType)} />
          <Slider min={0} max={3} stepSize={1}
            onChange={props.setFilterLevel(logType)}
            value={props.state[logType] as number} />
        </fieldset>;
      })}
  </div>;
};
