interface Token {
  unencoded: UnencodedToken;
  encoded: string;
}

export interface AuthState {
  token: Token;
}

interface UnencodedToken {
  /** ISSUER - Where token came from (API URL). */
  iss: string;
  /** JSON Token Identifier- auto sync needs this to hear its echo on MQTT */
  jti: string;
  /** Audience claim - usually "bot", "human", or "unknown" */
  aud: string;
  /** This is the username for the MQTT server. Follows format of `device_x`,
   * where `x` represents the device's `id` property. */
  bot: string;
  /** URL for MQTT over websockets. */
  mqtt_ws: string;
}
