/// <reference path="../typings/index.d.ts" />
/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 *
 * Try to keep this file light. */
import { detectLanguage } from "./i18n";
import { stopIE, shortRevision } from "./util";
import { init } from "i18next";
import { attachAppToDom } from "./routes";
import { maybeRunLocalstorageMigration } from "./storage_key_translator";

stopIE();

console.log(shortRevision());

maybeRunLocalstorageMigration();

detectLanguage().then(config => init(config, attachAppToDom));
