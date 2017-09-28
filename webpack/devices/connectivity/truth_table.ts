import { Dictionary } from "farmbot";
import { DiagnosticMessages } from "./diagnostic_messages";

// I don't like this at all.
// If anyone has a cleaner solution, I'd love to hear it.
// Truth table that maps error codes to human readable explanations.
export const TRUTH_TABLE: Readonly<Dictionary<string | undefined>> = {
  // 0: Nothing works anywhere
  [0b00000]: DiagnosticMessages.TOTAL_BREAKAGE,
  // 1: The websocket connection broke locally, but once worked.
  [0b00001]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b10001]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 2: At least the browser is connected to MQTT.
  [0b10010]: DiagnosticMessages.WIFI_OR_CONFIG,
  // 3: leftover firmware version data.
  [0b00011]: DiagnosticMessages.WIFI_OR_CONFIG,
  [0b10011]: DiagnosticMessages.WIFI_OR_CONFIG,
  // 4: bot last seen by the API recently.
  [0b00100]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b10100]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 5: leftover firmware version data.
  [0b00101]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b10101]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 6: Farmbot just went offline or FarmBot's MQTT access is blocked.
  [0b00110]: DiagnosticMessages.REMOTE_FIREWALL,
  [0b10110]: DiagnosticMessages.REMOTE_FIREWALL,
  // 7: Farmbot just went offline or FarmBot's MQTT access is blocked.
  [0b00111]: DiagnosticMessages.REMOTE_FIREWALL,
  [0b10111]: DiagnosticMessages.REMOTE_FIREWALL,
  // 8: FBOS is only connected to MQTT.
  [0b01000]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b11000]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 9: firmware version data sent over bot's MQTT.
  [0b01001]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b11001]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 10: The Arduino is not connected to FBOS.
  [0b01010]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  [0b11010]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 11: FarmBot's HTTP access is blocked.
  [0b01011]: DiagnosticMessages.INACTIVE,
  [0b11011]: DiagnosticMessages.INACTIVE,
  // 12: FBOS is connected
  [0b01100]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b11100]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 13: ???
  [0b01101]: DiagnosticMessages.NO_WS_AVAILABLE,
  [0b11101]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 14: The Arduino is not connected to FBOS.
  [0b01110]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  [0b11110]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 31: Everything is online.
  [0b11111]: DiagnosticMessages.OK
};
