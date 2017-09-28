import * as React from "react";
import { DiagnosticMessages } from "./diagnostic_messages";
import { Col, Row } from "../../ui/index";

export type DiagnosisName =
  | "userAPI"
  | "botMQTT"
  | "botAPI"
  | "userMQTT"
  | "botFirmware";

export type DiagnosisProps = Record<DiagnosisName, boolean>;

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisStatus =
    props.userMQTT && props.botAPI && props.botMQTT && props.botFirmware;
  const diagnosisColor = diagnosisStatus ? "green" : "red";
  const title = diagnosisStatus ? "Ok" : "Error";
  return <div>
    <div className={"connectivity-diagnosis"}>
      <h4>Diagnosis</h4>
    </div>
    <Row>
      <Col xs={1}>
        <div className={"saucer active " + diagnosisColor} title={title} />
        <div className={"saucer-connector last " + diagnosisColor} />
      </Col>
      <Col xs={10} className={"connectivity-diagnosis"}>
        <p>
          {diagnose(props)}
        </p>
      </Col>
    </Row>
  </div>;
}

// I don't like this at all. If anyone has a cleaner solution,
// I'd love to hear it. Implements a "truth table".
export function diagnose(x: DiagnosisProps) {
  const botFWFlag = x.botFirmware ? 0b0001 : 0;
  const userMQFlag = x.userMQTT ? 0b0010 : 0;
  const botAPIFlag = x.botAPI ? 0b0100 : 0;
  const botMQFlag = x.botMQTT ? 0b1000 : 0;
  // tslint:disable-next-line:no-bitwise
  const errorCode = botAPIFlag | botMQFlag | userMQFlag | botFWFlag;
  switch (errorCode) {
    // 0: Nothing works on either end.
    case 0b0000: // code 0
      return DiagnosticMessages.TOTAL_BREAKAGE;

    // At least the browser is connected to MQTT.
    case 0b0010: // Code 2
    case 0b0011: // Code 3 (leftover firmware version data)
      return DiagnosticMessages.WIFI_OR_CONFIG;

    // The websocket connection broke locally, but once worked.
    case 0b0001: // code 1 (leftover firmware version data)
    case 0b0100: // code 4 (bot last seen by the API recently)
    case 0b0101: // code 5 (leftover firmware version data)
    case 0b1000: // code 8 (FBOS is only connected to MQTT)
    case 0b1001: // code 9 (firmware version data sent over bot's MQTT)
    case 0b1100: // code 12 (FBOS is connected)
    case 0b1101: // code 13
      return DiagnosticMessages.NO_WS_AVAILABLE;

    // Farmbot just went offline or FarmBot's MQTT access is blocked.
    case 0b0110: // code 6
    case 0b0111: // code 7 (leftover firmware version data)
      return DiagnosticMessages.REMOTE_FIREWALL;

    // FarmBot's HTTP access is blocked.
    case 0b1011: // code 11
      return DiagnosticMessages.INACTIVE;

    // The Arduino is not connected to FBOS.
    case 0b1010: // code 10 (inactive)
    case 0b1110: // Code 14
      return DiagnosticMessages.ARDUINO_DISCONNECTED;

    // Everything's ok.
    case 0b1111: // Code 15
      return DiagnosticMessages.OK;

    default: // all others
      return DiagnosticMessages.MISC;
  }
}
