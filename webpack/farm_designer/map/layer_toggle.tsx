import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { t } from "i18next";

export interface LayerToggleProps {
  label: string;
  value: boolean | undefined;
  onClick(): void;
  popover?: JSX.Element;
}

/** A flipper type switch for showing/hiding the layers of the garden map. */
export function LayerToggle({ label, value, onClick, popover }: LayerToggleProps) {
  const klassName = "fb-button fb-toggle-button " + (value ? "green" : "red");
  return <fieldset>
    <label>
      <span>
        {label}
        {popover &&
          <Popover
            position={Position.BOTTOM_RIGHT}
            className={"caret-menu-button"}>
            <i className="fa fa-caret-down" title={t("filter")} />
            {popover}
          </Popover>}
      </span>
    </label>
    <button className={klassName} onClick={onClick} />
  </fieldset>;
}
