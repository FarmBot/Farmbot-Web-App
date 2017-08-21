import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetHeader } from "../ui";
import { WebcamPanelState, WebcamPanelProps, WebcamFeed } from "./interfaces";
import { PLACEHOLDER_FARMBOT } from "../farmware/images/image_flipper";
import { showUrl } from "./show_url";
import { ToolTips } from "../constants";
import { overwrite, edit, save } from "../api/crud";
import { API } from "../api/api";
import { createOK } from "../resources/actions";
import axios from "axios";
import { HttpData } from "../util";

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

  resetURL = () => {
    axios
      .get(API.current.devicePath)
      .then((resp: HttpData<WebcamFeed>) => {
        // TODO: We're starting to hit use cases where we need edit/undo.
        //       Revisit this one when undo/redo is implemented.
        this.props.dispatch(overwrite(this.props.feed, resp.data));
        this.props.dispatch(createOK(this.props.feed));
      });
  }

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
              onClick={this.save}
            >
              {t("Save")}{this.props.feed.specialStatus ? "" : "*"}
            </button>
          }
          {isEditing &&
            <button
              className="fb-button gray"
              onClick={this.resetURL}
            >
              {t("Reset")}
            </button>
          }
          {!isEditing &&
            <button
              className="fb-button gray"
              onClick={this.toggle}
            >
              {t("Edit")}
            </button>
          }
        </WidgetHeader>
        {isEditing &&
          <div>
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
