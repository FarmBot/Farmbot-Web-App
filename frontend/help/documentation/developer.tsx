import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const DeveloperDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.developerDocs} />;

// eslint-disable-next-line import/no-default-export
export default DeveloperDocsPanel;
