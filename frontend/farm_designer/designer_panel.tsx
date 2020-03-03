import * as React from "react";
import { history as routeHistory } from "../history";
import { last, trim } from "lodash";
import { Link } from "../link";
import { Panel, TAB_COLOR, PanelColor } from "./panel_header";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";

interface DesignerPanelProps {
  panelName: string;
  panel?: Panel;
  panelColor?: PanelColor;
  children?: React.ReactNode;
}

export const DesignerPanel = (props: DesignerPanelProps) => {
  const color = props.panel ? TAB_COLOR[props.panel] : props.panelColor;
  return <div
    className={[
      "panel-container",
      `${color || PanelColor.gray}-panel`,
      `${props.panelName}-panel`].join(" ")}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
};

interface DesignerPanelHeaderProps {
  panelName: string;
  panel?: Panel;
  panelColor?: PanelColor;
  title?: string;
  blackText?: boolean;
  description?: string;
  descriptionElement?: JSX.Element;
  backTo?: string;
  onBack?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

const backToText = (to: string | undefined): string => {
  const lastPathName = last(trim(to, "/").split("/"));
  const s = (lastPathName || "").replace("_", " ");
  return s ? ` ${t("to")} ${s}` : "";
};

export const DesignerPanelHeader = (props: DesignerPanelHeaderProps) => {
  const color = props.panel ? TAB_COLOR[props.panel] : props.panelColor;
  const textColor = props.blackText ? "black" : "white";
  return <div className={`panel-header ${color || PanelColor.gray}-panel`}
    style={props.style || {}}>
    <p className="panel-title">
      <i className={`fa fa-arrow-left back-arrow ${textColor}-text`}
        title={t("go back") + backToText(props.backTo)}
        onClick={() => {
          props.backTo ? routeHistory.push(props.backTo) : history.back();
          props.onBack?.();
        }} />
      {props.title &&
        <span className={`title ${textColor}-text`}>
          {t(props.title)}
        </span>}
      {props.children}
    </p>

    {(props.description || props.descriptionElement) &&
      <div
        className={trim(`panel-header-description ${props.panelName}-description
          ${textColor}-text`)}>
        {props.description && t(props.description)}
        {props.descriptionElement}
      </div>}
  </div>;
};

interface DesignerPanelTopProps {
  panel: Panel;
  linkTo?: string;
  onClick?(): void;
  title?: string;
  children?: React.ReactNode;
  noIcon?: boolean;
}

export const DesignerPanelTop = (props: DesignerPanelTopProps) => {
  const withBtn = !!props.linkTo || !!props.onClick;
  return <div className={`panel-top ${withBtn ? "with-button" : ""}`}>
    <div className="thin-search-wrapper">
      <div className="text-input-wrapper">
        {!props.noIcon &&
          <i className="fa fa-search" />}
        <ErrorBoundary>
          {props.children}
        </ErrorBoundary>
      </div>
    </div>
    {props.onClick &&
      <a>
        <div className={`fb-button panel-${TAB_COLOR[props.panel]}`}
          onClick={props.onClick}>
          <i className="fa fa-plus" title={props.title} />
        </div>
      </a>}
    {props.linkTo &&
      <Link to={props.linkTo}>
        <div className={`fb-button panel-${TAB_COLOR[props.panel]}`}>
          <i className="fa fa-plus" title={props.title} />
        </div>
      </Link>}
  </div>;
};

interface DesignerPanelContentProps {
  panelName: string;
  children?: React.ReactNode;
  className?: string;
}

export const DesignerPanelContent = (props: DesignerPanelContentProps) =>
  <div className={[
    "panel-content",
    `${props.panelName}-panel-content`,
    props.className || ""].join(" ")}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
