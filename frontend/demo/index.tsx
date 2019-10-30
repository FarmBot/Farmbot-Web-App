import { detectLanguage } from "../i18n";
import { attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I, { InitOptions } from "i18next";
import { DemoIframe } from "./demo_iframe";

// ENTRY POINT FOR WEB APP DEMO IFRAME ===========

stopIE();

const doAttach = () => attachToRoot(DemoIframe);
const loadDemo =
  (config: InitOptions) => I.init(config, doAttach);

detectLanguage().then(loadDemo);
