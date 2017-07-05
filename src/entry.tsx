/// <reference path="../typings/index.d.ts" />
import * as React from "react";
import { RootComponent } from "./routes";
import { store } from "./redux/store";
import { ready } from "./config/actions";
import { detectLanguage } from "./i18n";
import * as i18next from "i18next";
import "./npm_addons";
import { stopIE, attachToRoot, shortRevision } from "./util";

stopIE();
interface DebugStuff {
  ip_address: string;
}
let r = shortRevision();
console.log(r);

/** For external device debugging purposes
 * See https://github.com/FarmBot/farmbot-web-frontend for details. */
let hmm = process.env.CONFIG as DebugStuff | undefined;
if (hmm
  && hmm.ip_address
  && process.env.NODE_ENV !== "production") {
  let ip = hmm.ip_address;
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
