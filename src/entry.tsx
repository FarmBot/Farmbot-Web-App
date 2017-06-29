/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import { RootComponent } from "./routes";
import { store } from "./redux/store";
import { ready } from "./config/actions";
import { detectLanguage } from "./i18n";
import * as i18next from "i18next";
import "./npm_addons";
import { stopIE, attachToRoot } from "./util";

stopIE();

let r = (process.env.REVISION as string) || "REVISION INFO NOT AVAILABLE";
console.log(r);

/** For external device debugging purposes
 * See https://github.com/FarmBot/farmbot-web-frontend for details. */
if (process.env.CONFIG
  && process.env.CONFIG.ip_address
  && process.env.NODE_ENV !== "production") {
  let ip = process.env.CONFIG.ip_address;
  let script = document.createElement("script");
  script.src = `http://${ip}:8081/target/target-script-min.js#anonymous`;
  document.body.appendChild(script);
}

detectLanguage().then((config) => {
  i18next.init(config, (err, t) => {
    attachToRoot(RootComponent, { store });
    store.dispatch(ready());
  });
});
