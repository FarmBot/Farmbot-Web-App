import * as React from "react";
import { t } from "i18next";

// No reusability here. Why not just keep it from taking up sass?
const STYLES: React.CSSProperties = {
  "textAlign": "center",
  "marginTop": "5rem"
};

export class FourOhFour extends React.Component<{}, {}> {
  render() {
    return <div className="404">
      <div className="all-content-wrapper">
        <h1 style={STYLES}>
          {t("Page Not Found.")}
        </h1>
      </div>
    </div>;
  }
}
