export interface Token {
  unencoded: UnencodedToken;
  encoded: string;
}

export interface AuthState {
  token: Token;
}

export interface UnencodedToken {
  // /** SUBJECT - The user's email. STOP USING THIS! */
  // sub: string;
  /** ISSUED AT */
  iat: number;
  /** JSON TOKEN IDENTIFIER - a serial number for the token. */
  jti: string;
  /** ISSUER - Where token came from (API URL). */
  iss: string;
  /** EXPIRATION DATE */
  exp: number;
  /** MQTT server address */
  mqtt: string;
  /** BOT UNIQUE IDENTIFIER */
  bot: string;
  /** Where to download RPi software */
  os_update_server: string;
  /** Where to download firmware. */
  fw_update_server: string;
}

export interface User {
  id: number;
  device_id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}
