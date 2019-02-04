import {
  createElement,
  ComponentClass,
  Attributes
} from "react";
import { render } from "react-dom";
import { t } from "i18next";
import { capitalize } from "lodash";

/** Dynamically change the meta title of the page. */
export function updatePageInfo(pageName: string) {
  if (pageName === "designer") { pageName = "Farm Designer"; }
  document.title = t(capitalize(pageName));
  // Possibly add meta "content" here dynamically as well
}

export function attachToRoot<P>(type: ComponentClass<P>,
  props?: Attributes & P) {
  const node = document.createElement("DIV");
  node.id = "root";
  document.body.appendChild(node);

  const reactElem = createElement(type, props);
  const domElem = document.getElementById("root");

  domElem && render(reactElem, domElem);
}
