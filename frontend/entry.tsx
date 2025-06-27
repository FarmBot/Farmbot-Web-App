// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./hacks.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 * Try to keep this file light. */
import { detectLanguage } from "./i18n";
import { stopIE } from "./util/stop_ie";
import { attachAppToDom } from "./routes";
import { init } from "i18next";
import { initPWA } from "./util";

stopIE();
detectLanguage().then(config => init(config, () => {
  attachAppToDom();
  initPWA();
}));
