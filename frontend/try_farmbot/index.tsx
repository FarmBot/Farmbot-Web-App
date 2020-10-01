import { detectLanguage } from "../i18n";
import { attachToRoot } from "../util";
import { stopIE } from "../util/stop_ie";
import I, { InitOptions } from "i18next";
import { TryFarmbot } from "./try_farmbot";

// ENTRY POINT FOR WEB APP DEMO LINK ===========

stopIE();

const doAttach = () => attachToRoot(TryFarmbot);
const loadDemo = (config: InitOptions) => I.init(config, doAttach);

detectLanguage().then(loadDemo);
