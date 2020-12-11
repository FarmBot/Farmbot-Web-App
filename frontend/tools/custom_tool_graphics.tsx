import React from "react";
import { t } from "../i18next_wrapper";
import { BlurableInput, Color } from "../ui";
import { DevSettings } from "../settings/dev/dev_support";
import { reduceFarmwareEnv } from "../farmware/state_to_props";
import { store } from "../redux/store";
import { UserEnv } from "../devices/interfaces";
import { SaveFarmwareEnv } from "../farmware/interfaces";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";

interface CustomToolGraphics {
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

export interface CustomToolProfileProps {
  toolName: string | undefined;
  xToolMiddle: number;
  yToolBottom: number;
  sideView: boolean;
}

export interface CustomToolTopProps {
  toolName: string | undefined;
  x: number;
  y: number;
}

const INPUTS = (): Record<keyof CustomToolGraphics, string> => ({
  top: "",
  front: "",
  side: t("same as front"),
  mirror: t("not mirrored"),
});

export const getCustomToolGraphicsKey = (toolName: string) =>
  `custom_tool_graphics_${toolName.toLowerCase()}`;

const getCustomToolGraphics = (
  toolName: string | undefined,
  env?: UserEnv,
): CustomToolGraphics | undefined => {
  if (!toolName) { return undefined; }
  const toolGraphicsKey = getCustomToolGraphicsKey(toolName);
  const envs = env || reduceFarmwareEnv(store.getState().resources.index);
  const customToolGraphics = JSON.parse(envs[toolGraphicsKey] || "{}");
  return customToolGraphics;
};

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
        {Object.entries(INPUTS())
          .map(([view, placeholder]: [keyof CustomToolGraphics, string]) =>
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

export const CustomToolProfile = (props: CustomToolProfileProps) => {
  const { toolName, sideView, xToolMiddle, yToolBottom } = props;
  const customToolGraphics = getCustomToolGraphics(toolName);
  if (!customToolGraphics?.front) { return <g id={"custom"} />; }
  const customProfilePath = (sideView && customToolGraphics.side)
    ? customToolGraphics.side
    : customToolGraphics.front;
  const origin = `${xToolMiddle} ${yToolBottom}`;
  const transformOrigin = `${xToolMiddle}px ${yToolBottom}px`;
  return <g id={"custom-implement-profile"}
    fill={Color.darkGray} opacity={0.25}>
    <path d={`M${origin} ${customProfilePath}`} />
    {customToolGraphics.mirror &&
      <path style={{ transform: "scale(-1,1)", transformOrigin }}
        d={`M${origin} ${customProfilePath}`} />}
  </g>;
};

export const CustomToolTop = (props: CustomToolTopProps) => {
  const customToolGraphics = getCustomToolGraphics(props.toolName);
  if (!customToolGraphics?.top) { return <g id={"custom"} />; }
  return <path id={"custom-top"}
    d={`M${props.x} ${props.y} ${customToolGraphics.top}`}
    fill={Color.darkGray} opacity={0.25} />;
};
