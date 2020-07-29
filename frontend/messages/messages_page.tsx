import * as React from "react";
import { Page } from "../ui/index";
import { t } from "../i18next_wrapper";
import { push } from "../history";

/** Messages page redirect. */
export class Messages extends React.Component {
  render() {
    push("/app/designer/messages");
    return <Page className="messages-page">
      <p>{t("This page has moved. Redirecting...")}</p>
    </Page>;
  }
}
