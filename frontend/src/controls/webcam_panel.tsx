import * as React from "react";
import { t } from "i18next";
import { Widget, WidgetHeader } from "../ui";
import { WebcamPanelState, Props } from "./interfaces";
import { PLACEHOLDER_FARMBOT } from "../images/index";
import { showUrl } from "./show_url";
import { ToolTips } from "../constants";
import { overwrite, edit, save } from "../api/crud";
import { API } from "../api/api";
import { DeviceAccountSettings } from "../devices/interfaces";
import { createOK } from "../resources/actions";
import * as axios from "axios";

export class WebcamPanel
  extends React.Component<Props, Partial<WebcamPanelState>> {

  state: WebcamPanelState = { isEditing: false };

  toggle = () => { this.setState({ isEditing: !this.state.isEditing }); }

  save = () => {
    this.props.dispatch(save(this.props.account.uuid));
    this.toggle();
  };

  edit = (update: Partial<DeviceAccountSettings>) => {
    this.props.dispatch(edit(this.props.account, update));
  };

  clearURL = () => {
    axios
      .get<DeviceAccountSettings>(API.current.devicePath)
      .then(resp => {
        // TODO: We're starting to hit use cases where we need edit/undo.
        //       Revisit this one when undo/redo is implemented.
        this.props.dispatch(overwrite(this.props.account, resp.data));
        this.props.dispatch(createOK(this.props.account));
      });
  }

  render() {
    let url = this.props.account.body.webcam_url || PLACEHOLDER_FARMBOT;
    let dirty = !!this.props.bot.dirty;
    let { isEditing } = this.state;

    return <Widget>
      <WidgetHeader title="Camera" helpText={ToolTips.WEBCAM_SAVE}>
        {isEditing ?
          <button
            className="fb-button green"
            onClick={this.save}
          >
            {t("Save")}{this.props.account.dirty ? "*" : ""}
          </button>
          :
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
          <button
            className="fb-button clear-webcam-url-btn"
            onClick={this.clearURL}
          >
            <i className="fa fa-times"></i>
          </button>
          <input
            type="text"
            onChange={e => this.edit({ webcam_url: e.currentTarget.value })}
            placeholder="https://"
            value={this.props.account.body.webcam_url}
            className="webcam-url-input" />
        </div>
      }
      {showUrl(url, dirty)}
    </Widget>
  }
}
