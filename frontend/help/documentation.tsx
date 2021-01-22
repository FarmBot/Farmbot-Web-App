import React from "react";
import { ExternalUrl } from "../external_urls";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { HelpHeader } from "./header";

export interface DocumentationPanelProps {
  url: string;
}

export const DocumentationPanel = (props: DocumentationPanelProps) =>
  <DesignerPanel panelName={"documentation"} panel={Panel.Help}>
    <DesignerNavTabs />
    <HelpHeader />
    <DesignerPanelContent panelName={"documentation"}>
      <iframe src={props.url} />
    </DesignerPanelContent>
  </DesignerPanel>;

export const SoftwareDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.softwareDocs} />;

export const DeveloperDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.developerDocs} />;
