import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const MetaDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.metaDocs} />;

export default MetaDocsPanel;
