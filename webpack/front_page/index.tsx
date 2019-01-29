import { detectLanguage } from "../i18n";
import * as i18next from "i18next";
import { stopIE } from "../util/stop_ie";
import { attachFrontPage } from "./front_page";

stopIE();

detectLanguage().then((config) => i18next.init(config, attachFrontPage));
