import * as React from "react";
import { history as routeHistory } from "../../history";
import { last, trim } from "lodash";
import { Link } from "../../link";
import { Panel, TAB_COLOR } from "../panel_header";
import { t } from "../../i18next_wrapper";

interface DesignerPanelProps {
  panelName: string;
  panelColor: string;
  children?: React.ReactNode;
}

export const DesignerPanel = (props: DesignerPanelProps) =>
  <div
    className={[
      "panel-container",
      `${props.panelColor}-panel`,
      `${props.panelName}-panel`].join(" ")}>
    {props.children}
  </div>;

interface DesignerPanelHeaderProps {
  panelName: string;
  panelColor: string;
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

const textcolor = (color: boolean | undefined) => {
  const coloring = color ? "black" : "white";
  return coloring;
};

export const DesignerPanelHeader = (props: DesignerPanelHeaderProps) =>
  <div className={`panel-header ${props.panelColor}-panel`}
    style={props.style || {}}>
    <p className="panel-title">
      <i className={`fa fa-arrow-left back-arrow ${textcolor(props.blackText)}-text`}
        title={t("go back") + backToText(props.backTo)}
        onClick={() => {
          props.backTo ? routeHistory.push(props.backTo) : history.back();
          props.onBack && props.onBack();
        }} />
      {props.title &&
        <span className={`title ${textcolor(props.blackText)}-text`}
        >{t(props.title)}</span>}
      {props.children}
    </p>

    {(props.description || props.descriptionElement) &&
      <div
        className={`panel-header-description ${props.panelName}-description ${textcolor(props.blackText)}-text`}>
        {props.description && t(props.description)}
        {props.descriptionElement}
      </div>}
  </div>;

interface DesignerPanelTopProps {
  panel?: Panel;
  linkTo?: string;
  title?: string;
  children?: React.ReactNode;
  noIcon?: boolean;
}

export const DesignerPanelTop = (props: DesignerPanelTopProps) => {
  return <div className={`panel-top ${props.linkTo ? "with-button" : ""}`}>
    <div className="thin-search-wrapper">
      <div className="text-input-wrapper">
        {!props.noIcon &&
          <i className="fa fa-search"></i>}
        {props.children}
      </div>
    </div>
    {props.linkTo &&
      <Link to={props.linkTo}>
        <div className={`fb-button panel-${TAB_COLOR[props.panel || Panel.Plants]}`}>
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
  <div className={
    `panel-content ${props.panelName}-panel-content ${props.className || ""}`
  }>
    {props.children}
  </div>;
