import * as React from "react";
import { render } from "react-dom";
import { t } from "i18next";
import { capitalize } from "lodash";

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
