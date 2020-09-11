import { render } from "react-dom";
import I from "i18next";
import { detectLanguage } from "../i18n";
import React from "react";
import { TosUpdate } from "./component";

const node = document.createElement("DIV");
node.id = "root";
document.body.appendChild(node);
const domElem = document.getElementById("root");
const reactElem = React.createElement(TosUpdate, {});

const ok = () => domElem && render(reactElem, domElem);

detectLanguage().then(conf => I.init(conf, ok));
