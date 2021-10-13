import React from "react";
import moment from "moment";
import { TaggedDevice } from "farmbot";
import { Content } from "../../constants";
import { t } from "../../i18next_wrapper";
import { TimeSettings } from "../../interfaces";
import { formatTime } from "../../util";
import { refresh } from "../../api/crud";
import { BotState } from "../../devices/interfaces";

export interface LastSeenNumberProps {
  bot: BotState;
  device: TaggedDevice;
}

export const lastSeenNumber = (props: LastSeenNumberProps) => {
  const { last_saw_api } = props.device.body;
  const { uptime } = props.bot.connectivity;
  const bot2Mqtt = uptime["bot.mqtt"];
  const botToMqttAt = bot2Mqtt?.state === "up" ? bot2Mqtt.at : "";
  const botToMqttLastSeen = new Date(botToMqttAt).getTime();
  const apiLastSeen = last_saw_api ? moment(last_saw_api).valueOf() : 0;
  if (!apiLastSeen) {
    return botToMqttLastSeen;
  }
  if (!botToMqttLastSeen) {
    return apiLastSeen;
  }
  if (moment(apiLastSeen).isAfter(botToMqttLastSeen)) {
    return apiLastSeen;
  }
  if (moment(botToMqttLastSeen).isAfter(apiLastSeen)) {
    return botToMqttLastSeen;
  }
  return botToMqttLastSeen;
};

export interface LastSeenProps {
  dispatch: Function;
  bot: BotState;
  device: TaggedDevice;
  timeSettings: TimeSettings;
}

export class LastSeen extends React.Component<LastSeenProps, {}> {
  get lastSeen() { return lastSeenNumber(this.props); }

  show = (): string => {
    if (this.props.device.specialStatus) {
      return t("Loading...");
    }

    if (this.lastSeen) {
      const { timeSettings } = this.props;
      return t("FarmBot was last seen {{ lastSeen }}", {
        lastSeen: formatTime(moment(this.lastSeen), timeSettings, "MMMM D, YYYY")
      });
    } else {
      return t(Content.DEVICE_NEVER_SEEN);
    }
  };

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
