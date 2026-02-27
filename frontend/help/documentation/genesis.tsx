import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const GenesisDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.genesisDocs} />;

export default GenesisDocsPanel;
