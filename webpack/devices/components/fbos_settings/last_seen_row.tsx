import * as React from "react";
import { Row, Col } from "../../../ui/index";
import { t } from "i18next";
import * as moment from "moment";
import { TaggedDevice } from "../../../resources/tagged_resources";
import { ColWidth } from "../farmbot_os_settings";

export interface LastSeenProps {
  onClick?(): void;
  botToMqttLastSeen: string;
  device: TaggedDevice;
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
      const text = " FarmBot was last seen {{ lastSeen }}";
      const data = {
        lastSeen: moment(this.lastSeen)
          .utcOffset(this.props.device.body.tz_offset_hrs)
          .format("MMMM D, h:mma")
      };
      return t(text, data);
    } else {
      return t("The device has never been seen. Most likely, there is a network connectivity issue on the device's end.");
    }
  }

  render() {
    return <Row>
      <Col xs={ColWidth.label}>
        <label>
          {t("LAST SEEN")}
        </label>
      </Col>
      <Col xs={ColWidth.description}>
        <p>
          <i className="fa fa-refresh" onClick={this.props.onClick}></i>
          {this.show()}
        </p>
      </Col>
    </Row>;
  }
}
