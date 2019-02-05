import { detectLanguage } from "../i18n";
import * as I18n from "i18next";
import { onInit } from "./on_init";

detectLanguage().then(async config => I18n.init(config, onInit));
