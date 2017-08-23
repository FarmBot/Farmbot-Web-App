import * as React from "react";
import { t } from "i18next";
import { ToggleButtonProps } from "./interfaces";
import { isUndefined } from "util";

export class ToggleButton extends React.Component<ToggleButtonProps, {}> {
  caption() {
    let useNoYes = isUndefined(this.props.noYes) ? true : this.props.noYes;
    let noOff = useNoYes ? t("no") : t("off");
    let yesOn = useNoYes ? t("yes") : t("on");
    let captions: { [s: string]: string | undefined } = {
      "0": noOff,
      "false": noOff,
      "off": noOff,
      "1": yesOn,
      "true": yesOn,
      "on": yesOn,
      "undefined": "🚫",
      "-1": "🚫"
    };
    let togval = String(this.props.toggleValue);
    return captions[togval] || "---";
  }

  css() {
    let css = "fb-toggle-button fb-button";
    if (this.props.disabled) { return css + " gray"; }
    let redCSS = css + " red";
    let greenCSS = css + " green";
    let yellowCSS = css + " yellow";

    let cssClasses: { [s: string]: string | undefined } = {
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
    let cb = () => !this.props.disabled && this.props.toggleAction();
    return (
      <button
        disabled={!!this.props.disabled}
        className={this.css()}
        onClick={cb}>
        {this.caption()}
      </button>
    );
  }
}
