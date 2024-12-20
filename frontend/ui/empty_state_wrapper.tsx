import React from "react";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";
import { FilePath } from "../internal_urls";

export enum EmptyStateGraphic {
  plants = "plants",
  crops = "crops",
  no_crop_results = "no_crop_results",
  curves = "no_crop_results",
  sequences = "sequences",
  regimens = "regimens",
  farm_events = "farm_events",
  groups = "groups",
  points = "points",
  tools = "tools",
  weeds = "weeds",
  zones = "zones",
}

export interface EmptyStateWrapperProps {
  notEmpty: unknown;
  title?: string;
  text?: string;
  textElement?: React.ReactNode;
  graphic: string;
  colorScheme?: "plants" | "events" | "gardens" | "points" | "tools"
  | "groups" | "weeds" | "zones" | "farmware" | "peripherals" | "sensors"
  | "location" | "curves";
  children?: React.ReactNode;
}

export const EmptyStateWrapper = (props: EmptyStateWrapperProps) =>
  props.notEmpty
    ? <div className="non-empty-state grid no-gap">
      <ErrorBoundary>
        {props.children}
      </ErrorBoundary>
    </div>
    : <div className={`empty-state ${props.colorScheme || ""}`}>
      <img
        className="empty-state-graphic"
        src={FilePath.emptyState(props.graphic)} />
      {props.title &&
        <h5>{t(props.title)}</h5>}
      {props.textElement || <div className={"no-empty-state-text"} />}
      {props.text &&
        <p>{t(props.text)}</p>}
    </div>;
