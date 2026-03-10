import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const SoftwareDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.softwareDocs} />;

export default SoftwareDocsPanel;
