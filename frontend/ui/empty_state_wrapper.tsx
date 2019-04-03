import * as React from "react";
import { t } from "../i18next_wrapper";

export enum EmptyStateGraphic {
  plants = "plants",
  crops = "crops",
  no_crop_results = "no_crop_results",
  sequences = "sequences",
  regimens = "regimens",
  no_farm_events = "no_farm_events",
}

interface EmptyStateWrapperProps {
  notEmpty: unknown;
  title?: string;
  text?: string;
  textElement?: JSX.Element;
  graphic: string;
  colorScheme?: "plants" | "events";
  children?: React.ReactNode;
}

export const EmptyStateWrapper = (props: EmptyStateWrapperProps) =>
  !!props.notEmpty
    ? <div className="non-empty-state">{props.children}</div>
    : <div className={`empty-state ${props.colorScheme || ""}`}>
      <img
        className="empty-state-graphic"
        src={`/app-resources/img/empty_state/${props.graphic}.png`} />
      {props.title &&
        <h5>{t(props.title)}</h5>}
      {props.textElement || <div />}
      {props.text &&
        <p>{t(props.text)}</p>}
    </div>;
