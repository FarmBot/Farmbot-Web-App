import { detectLanguage } from "../i18n";
import I from "i18next";
import { onInit } from "./on_init";

detectLanguage().then(async config => I.init(config, onInit));
