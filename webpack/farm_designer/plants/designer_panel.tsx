import * as React from "react";
import { t } from "i18next";
import { history as routeHistory } from "../../history";
import { last, trim } from "lodash";

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

export const DesignerPanelHeader = (props: DesignerPanelHeaderProps) =>
  <div className={`panel-header ${props.panelColor}-panel`}
    style={props.style || {}}>
    <p className="panel-title">
      <i className="fa fa-arrow-left back-arrow"
        title={t("go back") + backToText(props.backTo)}
        onClick={() => {
          props.backTo ? routeHistory.push(props.backTo) : history.back();
          props.onBack && props.onBack();
        }} />
      {props.title && <span className="title">{t(props.title)}</span>}
      {props.children}
    </p>

    {(props.description || props.descriptionElement) &&
      <div
        className={`panel-header-description ${props.panelName}-description`}>
        {props.description && t(props.description)}
        {props.descriptionElement}
      </div>}
  </div>;

export const DesignerPanelTop = (props: { children?: React.ReactNode }) =>
  <div className="panel-top">
    <div className="thin-search-wrapper">
      <div className="text-input-wrapper">
        <i className="fa fa-search"></i>
        {props.children}
      </div>
    </div>
  </div>;

interface DesignerPanelContentProps {
  panelName: string;
  children?: React.ReactNode;
}

export const DesignerPanelContent = (props: DesignerPanelContentProps) =>
  <div className={`panel-content ${props.panelName}-panel-content`}>
    {props.children}
  </div>;
