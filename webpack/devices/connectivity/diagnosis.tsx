import * as React from "react";
import { DiagnosticMessages } from "./diagnostic_messages";

export interface DiagnosisProps {
  botMQTT: boolean;
  botAPI: boolean;
  userMQTT: boolean;
}

export function Diagnosis(props: DiagnosisProps) {
  return <div>
    <h3>Diagnosis</h3>
    <p>
      {inferHelpText(props)}
    </p>
  </div>;
}

// I don't like this at all. If anyone has a cleaner solution,
// I'd love to hear it. Implements a "truth table".
function inferHelpText(x: DiagnosisProps) {
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
      return DiagnosticMessages.OK;

    default: // all others -
      return DiagnosticMessages.MISC;
  }
}
