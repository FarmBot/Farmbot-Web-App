import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { t } from "i18next";

export interface LayerToggleProps {
  label: string;
  value: boolean | undefined;
  onClick(): void;
  popover?: JSX.Element | undefined;
  submenuTitle?: string;
}

/** A flipper type switch for showing/hiding the layers of the garden map. */
export function LayerToggle(props: LayerToggleProps) {
  const { label, value, onClick, popover, submenuTitle } = props;
  const title = submenuTitle ? submenuTitle : t("more");
  const klassName = "fb-button fb-toggle-button " + (value ? "green" : "red");
  return <fieldset>
    <label>
      <span>
        {label}
        {popover &&
          <Popover
            targetClassName={"caret-menu-button"}
            position={Position.BOTTOM_RIGHT}
            className={"caret-menu-button"}>
            <i className="fa fa-caret-down" title={t(title)} />
            {popover}
          </Popover>}
      </span>
    </label>
    <button className={klassName} onClick={onClick} />
  </fieldset>;
}
