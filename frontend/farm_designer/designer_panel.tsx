import React from "react";
import { useNavigate } from "react-router";
import { last, trim } from "lodash";
import { Link } from "../link";
import { Panel, TAB_COLOR, PanelColor } from "./panel_header";
import { t } from "../i18next_wrapper";
import { ErrorBoundary } from "../error_boundary";
import { maybeBeacon } from "../help/tours";
import { SpecialStatus } from "farmbot";

interface DesignerPanelProps {
  panelName: string;
  panel?: Panel;
  panelColor?: PanelColor;
  children?: React.ReactNode;
}

export const DesignerPanel = (props: DesignerPanelProps) => {
  const color = props.panel ? TAB_COLOR[props.panel] : props.panelColor;
  const [beacon, setBeacon] = React.useState(maybeBeacon(props.panelName, "soft"));
  beacon && setTimeout(() => setBeacon(""), 1000);
  return <div
    className={[
      "panel-container",
      `${color || PanelColor.gray}-panel`,
      `${props.panelName}-panel`,
      "beacon-transition",
      beacon,
    ].join(" ")}>
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
  titleElement?: React.ReactNode;
  blackText?: boolean;
  description?: string;
  descriptionElement?: React.ReactNode;
  backTo?: string;
  onBack?: () => void;
  specialStatus?: SpecialStatus;
  onSave?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  colorClass?: string;
}

const backToText = (to: string | undefined): string => {
  const lastPathName = last(trim(to, "/").split("/"));
  const s = (lastPathName || "").replace("_", " ");
  return s ? ` ${t("to")} ${s}` : "";
};

export const DesignerPanelHeader = (props: DesignerPanelHeaderProps) => {
  const panelColor = props.panel ? TAB_COLOR[props.panel] : props.panelColor;
  const colorClass = props.colorClass || `${panelColor || PanelColor.gray}-panel`;
  const navigate = useNavigate();
  return <div className={`panel-header ${colorClass}`}
    style={props.style || {}}>
    <div className="panel-title">
      <i className={"fa fa-arrow-left back-arrow"}
        title={t("go back") + backToText(props.backTo)}
        onClick={() => {
          props.backTo ? navigate(props.backTo) : history.back();
          props.onBack?.();
        }} />
      {props.title &&
        <span className={"title"}>
          {t(props.title)}
        </span>}
      {props.titleElement}
      {props.specialStatus == SpecialStatus.DIRTY &&
        <p className={"saving-indicator"} onClick={props.onSave}>
          <i className={"fa fa-spinner fa-pulse"} />
          {t("saving...")}
        </p>}
      {props.children}
    </div>

    {(props.description || props.descriptionElement) &&
      <div className={[
        "panel-header-description",
        `${props.panelName}-description`,
      ].join(" ")}>
        {props.description && t(props.description)}
        {props.descriptionElement}
      </div>}
  </div>;
};

export interface DesignerPanelTopProps {
  panel: Panel;
  linkTo?: string;
  onClick?(): void;
  title?: string;
  children?: React.ReactNode;
  withButton?: boolean;
}

export const DesignerPanelTop = (props: DesignerPanelTopProps) => {
  const withBtn = !!props.withButton || !!props.linkTo || !!props.onClick;
  return <div className={[
    "panel-top",
    withBtn ? "with-button" : "",
  ].join(" ")}>
    {props.children}
    {props.onClick &&
      <a>
        <div className={"fb-button green"}
          onClick={props.onClick}>
          <i className="fa fa-plus" title={props.title} />
        </div>
      </a>}
    {props.linkTo &&
      <Link to={props.linkTo}>
        <div className={"fb-button green"}>
          <i className="fa fa-plus" title={props.title} />
        </div>
      </Link>}
  </div>;
};

export interface DesignerPanelContentProps {
  panelName: string;
  children?: React.ReactNode;
  className?: string;
}

export const DesignerPanelContent = (props: DesignerPanelContentProps) => {
  const content = document.getElementsByClassName("panel-content")[0];
  const contentScrolled = (content?.scrollTop || 0) > 0;
  return <div className={[
    "panel-content",
    `${props.panelName}-panel-content`,
    contentScrolled ? "scrolled" : "",
    props.className || "",
  ].join(" ")}>
    <ErrorBoundary>
      {props.children}
    </ErrorBoundary>
  </div>;
};
