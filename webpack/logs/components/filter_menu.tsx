import * as React from "react";
import { LogsFilterMenuProps, LogsState } from "../interfaces";
import * as _ from "lodash";

export const LogsFilterMenu = (props: LogsFilterMenuProps) => {
  const btnColor = (x: keyof LogsState) => props.state[x] ? "green" : "red";
  return <div className={"logs-settings-menu"}>
    {Object.keys(props.state)
      .filter(x => { if (!(x == "autoscroll")) { return x; } })
      .map((logType: keyof LogsState) => {
        return <fieldset key={logType}>
          <label>
            <div className={`saucer ${logType}`} />
            {_.startCase(logType)}
          </label>
          <button
            className={"fb-button fb-toggle-button " + btnColor(logType)}
            onClick={props.toggle(logType)} />
        </fieldset>;
      })}
  </div>;
};
