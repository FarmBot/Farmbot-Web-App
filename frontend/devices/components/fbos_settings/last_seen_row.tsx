import * as React from "react";
import moment from "moment";
import { TaggedDevice } from "farmbot";
import { Content } from "../../../constants";
import { t } from "../../../i18next_wrapper";
import { TimeSettings } from "../../../interfaces";
import { timeFormatString } from "../../../util";
import { refresh } from "../../../api/crud";

export interface LastSeenProps {
  dispatch: Function;
  botToMqttLastSeen: string;
  device: TaggedDevice;
  timeSettings: TimeSettings;
}

export class LastSeen extends React.Component<LastSeenProps, {}> {
  get lastSeen() {
    const { last_saw_api } = this.props.device.body;
    const { botToMqttLastSeen } = this.props;
    const lastSeenAll = () => {
      if (!last_saw_api) {
        return botToMqttLastSeen;
      }
      if (!botToMqttLastSeen) {
        return last_saw_api;
      }
      if (moment(last_saw_api).isAfter(botToMqttLastSeen)) {
        return last_saw_api;
      }
      if (moment(botToMqttLastSeen).isAfter(last_saw_api)) {
        return botToMqttLastSeen;
      }
    };
    return lastSeenAll();
  }

  show = (): string => {
    if (this.props.device.specialStatus) {
      return t("Loading...");
    }

    if (this.lastSeen) {
      const data = {
        lastSeen: moment(this.lastSeen)
          .utcOffset(this.props.timeSettings.utcOffset)
          .format(`MMMM D, ${timeFormatString(this.props.timeSettings)}`)
      };
      return t("FarmBot was last seen {{ lastSeen }}", data);
    } else {
      return t(Content.DEVICE_NEVER_SEEN);
    }
  }

  click = () => this.props.dispatch(refresh(this.props.device));

  render() {
    return <div className="last-seen-row">
      <p>
        <i className="fa fa-refresh" onClick={this.click}></i>
        {this.show()}
      </p>
    </div>;
  }
}
