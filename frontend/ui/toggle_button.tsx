import { isUndefined } from "lodash";
import React from "react";
import { t } from "../i18next_wrapper";
import {
  initSettingStatusState,
  SettingStatusIndicator, SettingStatusState, SETTING_SYNC_TIMEOUT,
} from "../settings/hardware_settings/setting_status_indicator";

export interface ToggleButtonProps {
  /** Function that is executed when the toggle button is clicked */
  toggleAction: (e: React.MouseEvent) => void;
  toggleValue: number | string | boolean | undefined;
  disabled?: boolean | undefined;
  customText?: { textFalse: string, textTrue: string };
  dim?: boolean;
  grayscale?: boolean;
  title?: string;
  className?: string;
  dispatch?: Function;
}

export class ToggleButton
  extends React.Component<ToggleButtonProps, SettingStatusState> {
  state: SettingStatusState = initSettingStatusState();

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
    return captions[togval] || " ";
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

  componentDidUpdate = () => {
    const inconsistent = this.props.dim;
    const changed = inconsistent != this.state.inconsistent;
    if (!isUndefined(inconsistent) && changed) {
      this.setState({ inconsistent, syncing: true });
      this.state.timeout && clearTimeout(this.state.timeout);
      const timeout = setTimeout(() => this.setState({ syncing: false }),
        SETTING_SYNC_TIMEOUT);
      this.setState({ timeout });
    }
  };

  render() {
    const allCss = [
      this.css(),
      this.props.className,
      (!this.props.dispatch && this.props.dim) ? "dim" : "",
      this.props.grayscale ? "grayscale" : "",
    ].join(" ");
    const cb = (e: React.MouseEvent) =>
      !this.props.disabled && this.props.toggleAction(e);
    return <button
      disabled={!!this.props.disabled}
      className={allCss}
      title={this.props.title || ""}
      onClick={cb}>
      {t(this.caption())}
      <SettingStatusIndicator
        dispatch={this.props.dispatch}
        wasSyncing={this.state.syncing}
        isSyncing={this.props.dim} />
    </button>;
  }
}
