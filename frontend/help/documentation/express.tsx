import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const ExpressDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.expressDocs} />;

export default ExpressDocsPanel;
