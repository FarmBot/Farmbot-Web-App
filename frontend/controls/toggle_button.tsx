import * as React from "react";
import { ToggleButtonProps } from "./interfaces";
import { t } from "../i18next_wrapper";

export class ToggleButton extends React.Component<ToggleButtonProps, {}> {
  caption() {
    const { textTrue, textFalse } = this.props.customText
      || { textFalse: t("no"), textTrue: t("yes") };
    const captions: { [s: string]: string | undefined } = {
      "0": textFalse,
      "false": textFalse,
      "off": textFalse,
      "1": textTrue,
      "true": textTrue,
      "on": textTrue,
      "undefined": "🚫",
      "-1": "🚫"
    };
    const togval = String(this.props.toggleValue);
    return captions[togval] || "---";
  }

  css() {
    const css = "fb-toggle-button fb-button ";
    const greenCSS = css + "green";
    const redCSS = css + "red";
    const yellowCSS = css + "yellow";

    const cssClasses: { [s: string]: string | undefined } = {
      "0": redCSS,
      "false": redCSS,
      "off": redCSS,
      "1": greenCSS,
      "true": greenCSS,
      "on": greenCSS,
      "undefined": yellowCSS
    };

    return cssClasses[String(this.props.toggleValue)] || yellowCSS;
  }

  render() {
    const addCss = (this.props.dim ? " dim" : "")
      + (this.props.grayscale ? " grayscale" : "");
    const cb = () => !this.props.disabled && this.props.toggleAction();
    return <button
      disabled={!!this.props.disabled}
      className={this.css() + addCss}
      title={this.props.title || ""}
      onClick={cb}>
      {t(this.caption())}
    </button>;
  }
}
