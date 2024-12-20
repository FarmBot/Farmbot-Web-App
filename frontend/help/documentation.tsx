import React from "react";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { getUrlQuery } from "../util";
import { HelpHeader } from "./header";

export interface DocumentationPanelProps {
  url: string;
}

export const DocumentationPanel = (props: DocumentationPanelProps) => {
  const page = getUrlQuery("page");
  return <DesignerPanel panelName={"documentation"} panel={Panel.Help}>
    <HelpHeader />
    <DesignerPanelContent panelName={"documentation"}>
      <iframe src={page ? `${props.url}/${page}` : props.url} />
    </DesignerPanelContent>
  </DesignerPanel>;
};
