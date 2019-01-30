import * as I18n from "i18next";

export const MISSING_DIV = "Add a div with id `root` to the page first.";

export const onInit: I18n.Callback = async () => {
  const React = await import("react");
  const { render } = await import("react-dom");
  const { PasswordReset } = await import("./password_reset");
  const { bail } = await import("../util");
  const node = document.createElement("DIV");
  node.id = "root";
  document.body.appendChild(node);

  const reactElem = React.createElement(PasswordReset, {});
  const domElem = document.getElementById("root");

  return (domElem) ? render(reactElem, domElem) : bail(MISSING_DIV);
};
