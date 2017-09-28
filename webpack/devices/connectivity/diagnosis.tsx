import * as React from "react";
import { DiagnosticMessages } from "./diagnostic_messages";
import { Col, Row } from "../../ui/index";

export interface DiagnosisProps {
  botMQTT: boolean;
  botAPI: boolean;
  userMQTT: boolean;
  botFirmware: boolean;
}

export function Diagnosis(props: DiagnosisProps) {
  const diagnosisStatus =
    props.userMQTT && props.botAPI && props.botMQTT && props.botFirmware;
  const diagnosisColor = diagnosisStatus ? "green" : "red";
  const title = diagnosisStatus ? "Ok" : "Error";
  const fwConnectionMessage = props.botFirmware
    ? ""
    : DiagnosticMessages.ARDUINO_DISCONNECTED;
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
        <p>
          {fwConnectionMessage}
        </p>
      </Col>
    </Row>
  </div>;
}

// I don't like this at all. If anyone has a cleaner solution,
// I'd love to hear it. Implements a "truth table".
export function diagnose(x: DiagnosisProps) {
  const userMQFlag = x.userMQTT ? 0b001 : 0;
  const botAPIFlag = x.botAPI ? 0b10 : 0;
  const botMQFlag = x.botMQTT ? 0b100 : 0;
  // tslint:disable-next-line:no-bitwise
  const errorCode = botAPIFlag | botMQFlag | userMQFlag;
  switch (errorCode) {
    // 0: Nothing works on either end.
    case 0b000: // code 0
      return DiagnosticMessages.TOTAL_BREAKAGE;

    case 0b001: // Code 1
      return DiagnosticMessages.WIFI_OR_CONFIG;
    // The websocket connection broke locally, but once worked.

    case 0b010: // code 2
    case 0b100: // code 4
    case 0b110: // code 6
      return DiagnosticMessages.NO_WS_AVAILABLE;

    // FarmBot's HTTP access is blocked.
    case 0b011: // code 3
      return DiagnosticMessages.REMOTE_FIREWALL;

    case 0b101: // code 5
      return DiagnosticMessages.INACTIVE;

    case 0b111: // Code 7
      if (x.botFirmware) {
        return DiagnosticMessages.OK;
      } else {
        // Arduino is disconnected, but everything else is ok. Display the
        // Arduino connectivity message (which is appended to every error
        // code message when disconnected) instead of the OK message.
        return "";
      }

    default: // all others -
      return DiagnosticMessages.MISC;
  }
}
