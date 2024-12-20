import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const SoftwareDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.softwareDocs} />;

// eslint-disable-next-line import/no-default-export
export default SoftwareDocsPanel;
