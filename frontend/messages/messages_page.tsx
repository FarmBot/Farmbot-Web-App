import React from "react";
import { Page } from "../ui";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { Path } from "../internal_urls";

/** Messages page redirect. */
export class Messages extends React.Component {
  render() {
    push(Path.messages());
    return <Page className="messages-page">
      <p>{t("This page has moved. Redirecting...")}</p>
    </Page>;
  }
}
