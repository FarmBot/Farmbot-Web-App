import * as React from "react";
import { render } from "react-dom";
import { detectLanguage } from "../i18n";
import { PasswordReset } from "./password_reset";
import * as i18next from "i18next";
import "../css/_index.scss";
import "../npm_addons";

detectLanguage().then((config) => {
  i18next.init(config, (err, t) => {
    let node = document.createElement("DIV");
    node.id = "root";
    document.body.appendChild(node);

    let reactElem = React.createElement(PasswordReset, {});
    let domElem = document.getElementById("root");

    if (domElem) {
      render(reactElem, domElem);
    } else {
      throw new Error(t("Add a div with id `root` to the page first."));
    };
  });
});
