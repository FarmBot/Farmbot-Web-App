import { TransferProps } from "./transfer_ownership";
import axios from "axios";

/** Given a server URL, generates a fully formed path to the transfer cert
 * endpoint. */
const certUrl = (server: string) => `${server}/api/users/control_certificate`;

/** Encrypt an email/password pair in order to transfer control of a device to
 * a different user. */
export async function createTransferCert(input: TransferProps): Promise<string> {
  const { server, email, password } = input;
  const { data } =
    await axios.post<string>(certUrl(server), { email, password });
  return Promise.resolve(data);
}
