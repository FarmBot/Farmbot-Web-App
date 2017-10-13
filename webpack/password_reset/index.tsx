import * as React from "react";
import "../css/_index.scss";
import { detectLanguage } from "../i18n";

detectLanguage().then(async (config) => {
  const i18next = await import("i18next");
  const { render } = await import("react-dom");
  const { PasswordReset } = await import("./password_reset");
  i18next.init(config, (err, t) => {
    const node = document.createElement("DIV");
    node.id = "root";
    document.body.appendChild(node);

    const reactElem = React.createElement(PasswordReset, {});
    const domElem = document.getElementById("root");

    if (domElem) {
      render(reactElem, domElem);
    } else {
      throw new Error(t("Add a div with id `root` to the page first."));
    }
  });
});
