import React from "react";
import { DocumentationPanel } from "../documentation";
import { ExternalUrl } from "../../external_urls";

export const EducationDocsPanel = () =>
  <DocumentationPanel url={ExternalUrl.eduDocs} />;

// eslint-disable-next-line import/no-default-export
export default EducationDocsPanel;
