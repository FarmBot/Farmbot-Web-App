import React from "react";
import { Page } from "../ui";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { Path } from "../internal_urls";

/** Controls page redirect. */
export class Controls extends React.Component {
  render() {
    push(Path.controls());
    return <Page className="controls-page">
      <p>{t("This page has moved. Redirecting...")}</p>
    </Page>;
  }
}
