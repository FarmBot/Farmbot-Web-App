import * as React from "react";
import { detectLanguage } from "../i18n";
import { FrontPage } from "./front_page";
import * as i18next from "i18next";
import "../css/_index.scss";
import "../npm_addons";
import { stopIE, attachToRoot } from "../util";

stopIE();

detectLanguage().then((config) => {
  i18next.init(config, (err, t) => {
    attachToRoot(FrontPage, {});
  });
});
