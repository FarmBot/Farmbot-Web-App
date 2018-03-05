import * as React from "react";
import { render } from "react-dom";
import { t } from "i18next";
import { capitalize } from "lodash";

/** We don't support IE. This method stops users from trying to use the site.
 * It's unfortunate that we need to do this, but the site simply won't work on
 * old browsers and our error logs were getting full of IE related bugs. */
export function stopIE() {
  function flunk() {
    // DO NOT USE i18next here.
    // IE Cannot handle it.
    const READ_THE_COMMENT_ABOVE = "This app only works with modern browsers.";
    alert(READ_THE_COMMENT_ABOVE);
    window.location.href = "https://www.google.com/chrome/";
  }
  try {
    const REQUIRED_GLOBALS = ["Promise", "console", "WebSocket", "Intl"];
    // Can't use Array.proto.map because IE.
    // Can't translate the text because IE (no promises)
    for (let i = 0; i < REQUIRED_GLOBALS.length; i++) {
      if (!window.hasOwnProperty(REQUIRED_GLOBALS[i])) {
        flunk();
      }
    }
    const REQUIRED_ARRAY_METHODS = ["includes", "map", "filter"];
    for (let i = 0; i < REQUIRED_ARRAY_METHODS.length; i++) {
      if (!Array.prototype.hasOwnProperty(REQUIRED_ARRAY_METHODS[i])) {
        flunk();
      }
    }

    if (!Object.entries) { flunk(); }
  } catch (error) {
    flunk();
  }
}

/** Dynamically change the meta title of the page. */
export function updatePageInfo(pageName: string) {
  if (pageName === "designer") { pageName = "Farm Designer"; }
  document.title = t(capitalize(pageName));
  // Possibly add meta "content" here dynamically as well
}

export function attachToRoot<P>(type: React.ComponentClass<P>,
  props?: React.Attributes & P) {
  const node = document.createElement("DIV");
  node.id = "root";
  document.body.appendChild(node);

  const reactElem = React.createElement(type, props);
  const domElem = document.getElementById("root");

  if (domElem) {
    render(reactElem, domElem);
  } else {
    throw new Error(t("Add a <div> with id `root` to the page first."));
  }
}
