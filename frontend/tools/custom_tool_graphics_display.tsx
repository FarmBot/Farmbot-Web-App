import React from "react";
import { UserEnv } from "../devices/interfaces";
import { reduceFarmwareEnv } from "../farmware/state_to_props";
import { Color } from "../ui";
import { store } from "../redux/store";

interface CustomToolGraphics {
  top?: string;
  front?: string;
  side?: string;
  mirror?: string;
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

export const getCustomToolGraphicsKey = (toolName: string) =>
  `custom_tool_graphics_${toolName.toLowerCase()}`;

export const getCustomToolGraphics = (
  toolName: string | undefined,
  env?: UserEnv,
): CustomToolGraphics | undefined => {
  if (!toolName) { return undefined; }
  const toolGraphicsKey = getCustomToolGraphicsKey(toolName);
  const envs = env || reduceFarmwareEnv(store.getState().resources.index);
  const customToolGraphics = JSON.parse(envs[toolGraphicsKey] || "{}");
  return customToolGraphics;
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
