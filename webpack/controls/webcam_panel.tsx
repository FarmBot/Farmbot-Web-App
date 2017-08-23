import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetHeader } from "../ui";
import { WebcamPanelState, WebcamPanelProps, WebcamFeed } from "./interfaces";
import { PLACEHOLDER_FARMBOT } from "../farmware/images/image_flipper";
import { showUrl } from "./show_url";
import { ToolTips } from "../constants";
import { edit, save } from "../api/crud";

export class WebcamPanel extends
  React.Component<WebcamPanelProps, Partial<WebcamPanelState>> {

  state: WebcamPanelState = { isEditing: false };

  toggle = () => { this.setState({ isEditing: !this.state.isEditing }); };

  save = () => {
    this.props.dispatch(save(this.props.feed.uuid));
    this.toggle();
  };

  edit = (update: Partial<WebcamFeed>) => {
    this.props.dispatch(edit(this.props.feed, update));
  };

  clearURL = () => {
    // TODO: This should set url to "", but the input box to "https://"
    this.props.dispatch(edit(this.props.feed, { url: "https://" }));
    (document.querySelector(".webcam-url-input") as HTMLInputElement).focus();
  }

  render() {
    let url = this.props.feed.body.url || PLACEHOLDER_FARMBOT;
    let dirty = !!this.props.bot.dirty;
    let { isEditing } = this.state;

    return (
      <Widget>
        <WidgetHeader title="Camera" helpText={ToolTips.WEBCAM_SAVE}>
          {isEditing &&
            <button
              className="fb-button green"
              onClick={this.save}>
              {t("Save")}{this.props.feed.specialStatus ? "" : "*"}
            </button>
          }
          {!isEditing &&
            <button
              className="fb-button gray"
              onClick={this.toggle}>
              {t("Edit")}
            </button>
          }
        </WidgetHeader>
        {isEditing &&
          <div className="widget-body">
            <label>{t("Set Webcam URL:")}</label>
            <input
              type="text"
              onChange={e => this.edit({ url: e.currentTarget.value })}
              placeholder="https://"
              value={this.props.feed.body.url}
              className="webcam-url-input" />
          </div>
        }
        {showUrl(url, dirty)}
      </Widget>
    );
  }
}
