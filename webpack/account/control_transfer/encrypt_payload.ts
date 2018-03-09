
// function doSign() {
//   const rsa = new RSAKey();
//   rsa.readPrivateKeyFromPEMString("");
//   const hashAlg = "---";
//   const hSig = rsa.sign(document.form1.msgsigned.value, hashAlg);
//   document.form1.siggenerated.value = linebrk(hSig, 64);
// }

interface EncryptionPayload { email: string; password: string; pubKey: string }

// Reference implementation:
// https://github.com/FarmBot/farmbot_os/blob/staging
//   /lib/farmbot/bootstrap/authorization.ex#L64-L104

export async function encryptPayload(i: EncryptionPayload): Promise<string> {
  const { email, password, pubKey } = i;
  debugger;
  return Promise.resolve(email + password + pubKey);
}
