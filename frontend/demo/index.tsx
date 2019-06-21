import { detectLanguage } from "../i18n";
import { shortRevision, attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I from "i18next";
import { DemoIframe } from "./demo_iframe";

// ENTRY POINT FOR WEB APP DEMO IFRAME ===========

stopIE();

console.log(shortRevision());
const doAttach = () => attachToRoot(DemoIframe);
const loadDemo =
  (config: I.InitOptions) => I.init(config, doAttach);

detectLanguage().then(loadDemo);
