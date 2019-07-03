/// <reference path="../typings/index.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 *
 * Try to keep this file light. */
import { detectLanguage } from "./i18n";
import { shortRevision } from "./util";
import { stopIE } from "./util/stop_ie";
import { attachAppToDom } from "./routes";
import I from "i18next";

console.log("Caching fix, attempt I");

stopIE();

console.log(shortRevision());

detectLanguage().then(config => I.init(config, attachAppToDom));
