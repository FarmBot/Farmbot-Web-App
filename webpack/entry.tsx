/// <reference path="../typings/index.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 */
import { RootComponent } from "./routes";
import { store } from "./redux/store";
import { ready } from "./config/actions";
import { detectLanguage } from "./i18n";
import * as i18next from "i18next";
import { stopIE, attachToRoot, shortRevision } from "./util";

stopIE();

console.log(shortRevision());

detectLanguage().then((config) => {
  i18next.init(config, (err, t) => {
    attachToRoot(RootComponent, { store });
    store.dispatch(ready());
  });
});
