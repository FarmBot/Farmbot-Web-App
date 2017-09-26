export namespace DiagnosticMessages {
  // "SCV good to go, sir." is also appropriate.
  export const OK = "All systems nominal.";

  export const MISC = "Some other issue is preventing FarmBot from working. " +
    "Please see the table above for more information.";

  export const TOTAL_BREAKAGE = "There is no access to FarmBot or MQTT. This " +
    "is usually caused by outdated browsers (Internet Explorer) or firewalls " +
    "that block WebSockets on port 3002";

  export const TEMP_DISCONNECT = "The browser's connection to FarmBot was " +
    "interrupted locally. This is often caused by intermittent " +
    " WiFi or mobile connections. ";

  export const REMOTE_FIREWALL = "FarmBot and the browser are both " +
    "connected to the internet, but something is blocking FarmBot from " +
    "accessing MQTT. Is a firewall blocking port 8888? Occasionally, this " +
    "issue is resolvable by refreshing the browser";

  export const WIFI_OR_CONFIG = "Your browser is connected correctly, but " +
    "we have no record of FarmBot ever connecting to the internet. This " +
    "usually happens because of a bad WiFi signal in the garden or because " +
    "you entered a bad password during configuration. A loss of power is " +
    "also possible.";
  export const WEBSOCKET_ISSUES = "FarmBot appears to be currently connected " +
    "to the internet (last seen at <date/time>), but also appears to be " +
    "behind a firewall and is unable to send and receive messages with your " +
    "web browser in real-time";
}
