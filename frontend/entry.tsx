/// <reference path="./hacks.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 * Try to keep this file light. */
import { detectLanguage } from "./i18n";
import { stopIE, temporarilyStopFrames } from "./util/stop_ie";
import { attachAppToDom } from "./routes";
import I from "i18next";

temporarilyStopFrames(top, self);
stopIE();
detectLanguage().then(config => I.init(config, attachAppToDom));
