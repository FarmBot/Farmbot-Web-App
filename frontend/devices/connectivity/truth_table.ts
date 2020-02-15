import { Dictionary } from "farmbot";
import { DiagnosticMessages } from "../../constants";
import { docLink } from "../../ui/doc_link";
import { trim } from "../../util/util";

const DiagnosticMessagesWiFiOrConfig =
  trim(`${DiagnosticMessages.WIFI_OR_CONFIG}
  ${docLink("for-it-security-professionals")}`);

// I don't like this at all.
// If anyone has a cleaner solution, I'd love to hear it.
// Truth table that maps error codes to human readable explanations.
export const TRUTH_TABLE: Readonly<Dictionary<string | undefined>> = {
  // userAPI, userMQTT, botMQTT, botAPI, botFirmware

  // 0: Nothing works anywhere.
  [0b00000]: DiagnosticMessages.TOTAL_BREAKAGE,
  // 16: Only the Browser and API are connected.
  [0b10000]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 1: Internet connection broke locally, but once worked.
  [0b00001]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 17: No MQTT connections.
  [0b10001]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 24: Browser is connected to API and MQTT.
  [0b11000]: DiagnosticMessagesWiFiOrConfig,
  // 9: At least the browser is connected to MQTT.
  [0b01001]: DiagnosticMessagesWiFiOrConfig,
  // 8: At least the browser is connected to MQTT.
  [0b01000]: DiagnosticMessagesWiFiOrConfig,
  // 25: Farmbot offline.
  [0b11001]: DiagnosticMessagesWiFiOrConfig,
  // 2: Browser offline. Farmbot last seen by the API recently.
  [0b00010]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 18: Farmbot last seen by the API recently.
  [0b10010]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 3: Browser offline.
  [0b00011]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 19: No MQTT connections.
  [0b10011]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 10: Farmbot just went offline or Farmbot's MQTT access is blocked.
  [0b01010]: DiagnosticMessages.REMOTE_FIREWALL,
  // 26: Farmbot just went offline or Farmbot's MQTT access is blocked.
  [0b11010]: DiagnosticMessages.REMOTE_FIREWALL,
  // 11: Farmbot just went offline or Farmbot's MQTT access is blocked.
  [0b01011]: DiagnosticMessages.REMOTE_FIREWALL,
  // 27: Farmbot just went offline or Farmbot's MQTT access is blocked.
  [0b11011]: DiagnosticMessages.REMOTE_FIREWALL,
  // 4: Browser offline. Farmbot is only connected to MQTT.
  [0b00100]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 20: Farmbot is only connected to MQTT.
  [0b10100]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 5: firmware version data sent over Farmbot's MQTT.
  [0b00101]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 21: firmware version data sent over Farmbot's MQTT.
  [0b10101]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 12: The Arduino is not connected to FBOS.
  [0b01100]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 28: The Arduino is not connected to FBOS.
  [0b11100]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 13: Farmbot's HTTP access is blocked or hasn't connected recently.
  [0b01101]: DiagnosticMessages.INACTIVE,
  // 29: Farmbot's HTTP access is blocked or hasn't connected recently.
  [0b11101]: DiagnosticMessages.INACTIVE,
  // 6: Browser offline. Farmbot is connected.
  [0b00110]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 22: Farmbot is connected.
  [0b10110]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 7: Browser offline.
  [0b00111]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 15: No browser API connection.
  [0b01111]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 23: No browser MQTT connection.
  [0b10111]: DiagnosticMessages.NO_WS_AVAILABLE,
  // 14: No browser API connection. The Arduino is not connected to FBOS.
  [0b01110]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 30: The Arduino is not connected to FBOS.
  [0b11110]: DiagnosticMessages.ARDUINO_DISCONNECTED,
  // 31: Everything is online.
  [0b11111]: DiagnosticMessages.OK
};
