import React from "react";
import { t } from "./i18next_wrapper";

export const FourOhFour = (_: {}) =>
  <div className="404">
    <div className="all-content-wrapper">
      <h2 style={{ textAlign: "center", marginTop: "5rem" }}>
        {t("Not Found")}
      </h2>
      <h4 style={{ textAlign: "center", fontStyle: "italic" }}>
        {t("Perhaps the page has moved?")}
      </h4>
      <h5 style={{ textAlign: "center", fontStyle: "italic" }}>
        {t("Double-check the URL or explore the navigation bar.")}
      </h5>
    </div>
  </div>;

// eslint-disable-next-line import/no-default-export
export default FourOhFour;
