import { render } from "react-dom";
import { init } from "i18next";
import { detectLanguage } from "../i18n";
import * as _React from "react";
import { createElement } from "react";
import { TosUpdate } from "./component";

const node = document.createElement("DIV");
node.id = "root";
document.body.appendChild(node);
const domElem = document.getElementById("root");
const reactElem = createElement(TosUpdate, {});

const ok = () => domElem && render(reactElem, domElem);

detectLanguage().then(conf => init(conf, ok));
