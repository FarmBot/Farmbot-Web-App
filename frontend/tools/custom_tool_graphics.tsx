import React from "react";
import { t } from "../i18next_wrapper";
import { BlurableInput } from "../ui";
import { DevSettings } from "../settings/dev/dev_support";
import { UserEnv } from "../devices/interfaces";
import { SaveFarmwareEnv } from "../farmware/interfaces";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";
import {
  getCustomToolGraphics,
  getCustomToolGraphicsKey,
} from "./custom_tool_graphics_display";
export {
  CustomToolProfile,
  CustomToolTop,
  getCustomToolGraphicsKey
} from "./custom_tool_graphics_display";
export type {
  CustomToolProfileProps,
  CustomToolTopProps
} from "./custom_tool_graphics_display";

export interface CustomToolGraphics {
  top?: string;
  front?: string;
  side?: string;
  mirror?: string;
}

export interface CustomToolGraphicsInputProps {
  toolName: string;
  dispatch: Function;
  saveFarmwareEnv: SaveFarmwareEnv;
  env: UserEnv;
}

const INPUTS = (): Record<keyof CustomToolGraphics, string> => ({
  top: "",
  front: "",
  side: t("same as front"),
  mirror: t("not mirrored"),
});

export const CustomToolGraphicsInput =
  (props: CustomToolGraphicsInputProps) => {
    const { toolName, dispatch } = props;
    const customToolGraphics = getCustomToolGraphics(toolName, props.env) || {};
    const saveGraphics = (graphics: CustomToolGraphics) => props.saveFarmwareEnv(
      getCustomToolGraphicsKey(toolName), JSON.stringify(graphics));
    const customTool = reduceToolName(toolName) == ToolName.tool;
    return (DevSettings.futureFeaturesEnabled() && customTool && toolName)
      ? <details className={"custom-tool-graphics-input"}>
        <summary><label>{t("custom tool graphics")}</label></summary>
        <p>path = M0,0 ______</p>
        {(Object.entries(INPUTS()) as [keyof CustomToolGraphics, string][])
          .map(([view, placeholder]) =>
            <div className={"graphics-input"} key={view}>
              <label>{t(view)}</label>
              <BlurableInput
                value={customToolGraphics[view] || ""}
                placeholder={placeholder}
                allowEmpty={true}
                onCommit={e => {
                  customToolGraphics[view] = e.currentTarget.value;
                  dispatch(saveGraphics(customToolGraphics));
                }} />
            </div>)}
      </details>
      : <div />;
  };
