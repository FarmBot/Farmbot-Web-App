import { trim } from "../../util";
import { t } from "i18next";

export namespace DiagnosticMessages {
  // "SCV good to go, sir." is also appropriate.
  export const OK = t("All systems nominal.");

  export const MISC = trim(t(`Some other issue is preventing FarmBot from
    working. Please see the table above for more information.`));

  export const TOTAL_BREAKAGE = trim(t(`There is no access to FarmBot or the
    message broker. This is usually caused by outdated browsers
    (Internet Explorer) or firewalls that block WebSockets on port 3002.`));

  export const REMOTE_FIREWALL = trim(t(`FarmBot and the browser are both
    connected to the internet (or have been recently). Try rebooting FarmBot
    and refreshing the browser. If the issue persists, something may be
    preventing FarmBot from accessing the message broker (used to communicate
    with your web browser in real-time). If you are on a company or school
    network, a firewall may be blocking port 5672.`));

  export const WIFI_OR_CONFIG = trim(t(`Your browser is connected correctly,
    but we have no recent record of FarmBot connecting to the internet.
    This usually happens because of a bad WiFi signal in the garden, a bad
    password during configuration, or a very long power outage.`));

  export const NO_WS_AVAILABLE = trim(t(`You are either offline, using a web
   browser that does not support WebSockets, or are behind a firewall that
   blocks port 3002. Do not attempt to debug FarmBot hardware until you solve
   this issue first. You will not be able to troubleshoot hardware issues
   without a reliable browser and internet connection.`));

  export const INACTIVE = trim(t(`FarmBot and the browser both have internet
    connectivity, but we haven't seen any activity from FarmBot on the Web
    App in a while. This could mean that FarmBot has not synced in a while,
    which might not be a problem. If you are experiencing usability issues,
    however, it could be a sign of HTTP blockage on FarmBot's local internet
    connection.`));

  export const ARDUINO_DISCONNECTED = trim(t(`Arduino is possibly unplugged.
    Check the USB cable between the Raspberry Pi and the Arduino. Reboot
    FarmBot after a reconnection. If the issue persists, reconfiguration
    of FarmBot OS may be necessary.`));
}
