import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const ExpressDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.expressDocs} />;

// eslint-disable-next-line import/no-default-export
export default ExpressDocsPanel;
