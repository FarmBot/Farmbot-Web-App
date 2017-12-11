import * as React from "react";
import { LogsFilterMenuProps, LogsState } from "../interfaces";
import * as _ from "lodash";
import { Slider } from "@blueprintjs/core";

export const LogsFilterMenu = (props: LogsFilterMenuProps) => {
  const btnColor = (x: keyof LogsState) => props.state[x] != 0
    ? "green" : "red";
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
          <Slider min={0} max={3} stepSize={1}
            onChange={props.setFilterLevel(logType)}
            value={props.state[logType] as number} />
        </fieldset>;
      })}
  </div>;
};
