import React from "react";
import { t } from "../../i18next_wrapper";
import { Popover } from "../../ui";
import { Position } from "@blueprintjs/core";

export interface MapSelectionPopoverProps {
  active: boolean;
  target: React.ReactElement | undefined;
  onCancel(): void;
}

const MapSelectionPrompt = (props: Pick<
  MapSelectionPopoverProps, "onCancel"
>) => <div className="help-text-content">
  {t("Choose a location in the map")}
  <button
    type={"button"}
    className={"fa fa-times fb-icon-button invert"}
    title={t("Cancel map selection")}
    onClick={props.onCancel} />
</div>;

export const MapSelectionPopover = (props: MapSelectionPopoverProps) => {
  const { active, onCancel, target } = props;
  React.useEffect(() => {
    if (!active) { return; }
    const cancelOnEscape = (event: KeyboardEvent) => {
      if (event.key == "Escape") {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", cancelOnEscape, true);
    return () => window.removeEventListener("keydown", cancelOnEscape, true);
  }, [active, onCancel]);

  return active
    ? <Popover
      className={"map-selection-popover"}
      position={Position.TOP}
      usePortal={false}
      isOpen={true}
      content={<MapSelectionPrompt onCancel={onCancel} />}
      target={target} />
    : target;
};
