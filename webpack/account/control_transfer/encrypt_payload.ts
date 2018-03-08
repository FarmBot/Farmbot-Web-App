// Reference implementation:
// https://github.com/FarmBot/farmbot_os/blob/staging
//   /lib/farmbot/bootstrap/authorization.ex#L64-L104

interface EncryptionPayload {
  email: string;
  password: string;
  pubKey: string
}

export async function encryptPayload(i: EncryptionPayload): Promise<string> {
  const { email, password, pubKey } = i;
  return Promise.resolve(email + password + pubKey);
}
