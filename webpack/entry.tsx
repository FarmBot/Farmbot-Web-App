/// <reference path="../typings/index.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 */
import { RootComponent } from "./routes";
import { store } from "./redux/store";
import { ready } from "./config/actions";
import { detectLanguage } from "./i18n";
import { stopIE, attachToRoot, shortRevision } from "./util";
import { init } from "i18next";

stopIE();

console.log(shortRevision());

detectLanguage().then(function (config) {
  init(config, (err, t) => {
    attachToRoot(RootComponent, { store });
    store.dispatch(ready());
  });
});
