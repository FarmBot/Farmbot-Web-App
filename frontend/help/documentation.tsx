import React from "react";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import { HelpHeader } from "./header";
import { useLocation } from "react-router";

export interface DocumentationPanelProps {
  url: string;
}

export const DocumentationPanel = (props: DocumentationPanelProps) => {
  const location = useLocation();
  const [src, setSrc] = React.useState("");

  React.useEffect(() => {
    const page = new URLSearchParams(location.search).get("page");
    setSrc(page ? `${props.url}/${page}` : props.url);
  }, [props, location]);

  return <DesignerPanel panelName={"documentation"} panel={Panel.Help}>
    <HelpHeader />
    <DesignerPanelContent panelName={"documentation"}>
      <iframe src={src} />
    </DesignerPanelContent>
  </DesignerPanel>;
};
