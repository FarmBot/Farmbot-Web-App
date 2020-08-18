/// <reference path="./hacks.d.ts" />

if (top != self) {
  if ((Math.random() * 100) > 50) {
    const message = `FarmBot will be removing the ability to embed the Web App
    in frames/iframes in an upcoming release. You appear to be using a site or
    application that embeds the Web App in a frame. Please contact the owner
    of this application (not FarmBot) and request that they update their
    application or self-host their own server.`
    alert(message);
  } else {
    console.log("Temporarily allowing use of frames")
  }
}

/**
 * THIS IS THE ENTRY POINT FOR THE MAIN PORTION OF THE WEB APP.
 * Try to keep this file light. */
import { detectLanguage } from "./i18n";
import { stopIE } from "./util/stop_ie";
import { attachAppToDom } from "./routes";
import I from "i18next";

stopIE();

detectLanguage().then(config => I.init(config, attachAppToDom));
