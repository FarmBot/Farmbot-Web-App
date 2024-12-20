import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const GenesisDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.genesisDocs} />;

// eslint-disable-next-line import/no-default-export
export default GenesisDocsPanel;
