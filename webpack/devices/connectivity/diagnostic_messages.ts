import { trim } from "../../util";

export namespace DiagnosticMessages {
  // "SCV good to go, sir." is also appropriate.
  export const OK = "All systems nominal.";

  export const MISC = trim(`Some other issue is preventing FarmBot from
    working. Please see the table above for more information.`);

  export const TOTAL_BREAKAGE = trim(`There is no access to FarmBot or MQTT.
    This is usually caused by outdated browsers (Internet Explorer) or
    firewalls that block WebSockets on port 3002`);

  export const REMOTE_FIREWALL = trim(`FarmBot and the browser are both
    connected to the internet, but something is blocking FarmBot from
    accessing MQTT. Is a firewall blocking port 8888? Occasionally, this
    issue is resolvable by refreshing the browser`);

  export const WIFI_OR_CONFIG = trim(`Your browser is connected correctly,
    but we have no recent record of FarmBot ever connecting to the internet.
    This usually happens because of a bad WiFi signal in the garden, a bad
    password during configuration, or a very long power outage.`);

  export const WEBSOCKET_ISSUES = trim(`FarmBot appears to be currently
    connected to the internet (last seen at <date/time>), but also appears
    to be behind a firewall and is unable to send and receive messages with
    your web browser in real-time`);

  export const NO_WS_AVAILABLE = trim(`You are either offline, using a web
   browser that does not support WebSockets, or are behind a firewall that
   blocks port 3002. Do not attempt to debug FarmBot hardware until you solve
   this issue first. You will not be able to troubleshoot hardware issues
   without a reliable browser and internet connection.`);

  export const INACTIVE = trim(`FarmBot and the browser both have internet
    connectivity, but we haven't seen any activity from FarmBot on the API
    in a while. This could mean that FarmBot has not synced in a while,
    which might not be a problem. If you are experiencing usability issues,
    however, it could be a sign of HTTP blockage on FarmBot's local internet
    connection.`);
}
