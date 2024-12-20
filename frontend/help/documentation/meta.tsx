import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const MetaDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.metaDocs} />;

// eslint-disable-next-line import/no-default-export
export default MetaDocsPanel;
