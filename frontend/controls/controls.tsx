import * as React from "react";
import { Page } from "../ui/index";
import { t } from "../i18next_wrapper";
import { push } from "../history";

/** Controls page redirect. */
export class Controls extends React.Component {
  render() {
    push("/app/designer/controls");
    return <Page className="controls-page">
      <p>{t("This page has moved. Redirecting...")}</p>
    </Page>;
  }
}
