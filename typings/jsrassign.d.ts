// ORIGINAL: https://gist.github.com/jmurphzyo/38a93d3d6c66a469b0d98b2505ec9263

// var rsa = new RSAKey();
// rsa.readPrivateKeyFromPEMString(document.form1.prvkey1.value);
// var hashAlg = document.form1.hashalg.value;
// var hSig = rsa.sign(document.form1.msgsigned.value, hashAlg);
// document.form1.siggenerated.value = linebrk(hSig, 64);

declare type HSignature = string;

declare class RSAKey {
  readPrivateKeyFromPEMString(value: string): void;
  sign(value: string, hashAlg: string): HSignature;
}

declare module KJUR {
  module jws {
    module JWS {
      function readSafeJSONString(token: string): any;
      function verifyJWT(token: string, key: string, data: Object): boolean;
      function parse(jwt: any): void;
      function verify(jwt: never, key: never, AllowedSigningAlgs: never): void;
    }
  }
  module crypto {
    module Util {
      function hashString(value: never, alg: never): void;
    }
  }
}

declare module KEYUTIL {
  function getKey(cert: string): string;
}

declare function b64utos(token: string): void;

declare class TokenHeader {
  alg: string;
  type: string;
  kid: string;
}
declare function hextob64u(value: any): void;

declare module X509 {
  function getPublicKeyFromCertPEM(key: any): void;
}

declare class TokenClaims {
  nonce: string;
  family_name: string;
  ver: string;
  sub: string;
  city: string;
  iss: string;
  jobTitle: string;
  oid: string;
  state: string;
  name: string;
  acr: string;
  streetAddress: string;
  given_name: string;
  exp: string;
  auth_time: string;
  postalCode: string;
  iat: string;
  country: string;
  nbf: string;
  aud: string;
  email: string;
}
