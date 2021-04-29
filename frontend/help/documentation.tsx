import React from "react";
import { ExternalUrl } from "../external_urls";
import {
  DesignerPanel, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel, DesignerNavTabs } from "../farm_designer/panel_header";
import { getUrlQuery } from "../util";
import { HelpHeader } from "./header";

export interface DocumentationPanelProps {
  url: string;
}

export const DocumentationPanel = (props: DocumentationPanelProps) => {
  const page = getUrlQuery("page");
  return <DesignerPanel panelName={"documentation"} panel={Panel.Help}>
    <DesignerNavTabs />
    <HelpHeader />
    <DesignerPanelContent panelName={"documentation"}>
      <iframe src={page ? `${props.url}/${page}` : props.url} />
    </DesignerPanelContent>
  </DesignerPanel>;
};

export const SoftwareDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.softwareDocs} />;

export const DeveloperDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.developerDocs} />;

export const GenesisDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.genesisDocs} />;

export const ExpressDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.expressDocs} />;

export const MetaDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.metaDocs} />;

export const EducationDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.eduDocs} />;
