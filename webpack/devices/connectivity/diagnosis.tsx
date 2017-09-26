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
  const flag3 = x.userMQTT ? 0b001 : 0;
  const flag1 = x.botAPI ? 0b10 : 0;
  const flag2 = x.botMQTT ? 0b100 : 0;
  // tslint:disable-next-line:no-bitwise
  const errorCode = flag1 | flag2 | flag3;
  switch (errorCode) {
    // 0: Nothing works on either end.
    case 0b000: // code 0
      return DiagnosticMessages.TOTAL_BREAKAGE;

    // The websocket connection broke locally, but once worked.
    case 0b010: // code 2
    case 0b100: // code 4
    case 0b110: // code 6
      return DiagnosticMessages.TEMP_DISCONNECT;

    // FarmBot's HTTP access is blocked.
    case 0b011: // code 3
      return DiagnosticMessages.REMOTE_FIREWALL;

    case 0b111: // Code 7
      return DiagnosticMessages.OK;

    case 0b001: // Code 1
      return DiagnosticMessages.WIFI_OR_CONFIG;

    default: // Codes 1, 5 - Impossible :TM:
      return DiagnosticMessages.MISC;
  }
}
