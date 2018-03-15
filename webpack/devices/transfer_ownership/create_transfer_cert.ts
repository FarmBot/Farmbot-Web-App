import { TransferProps } from "./transfer_ownership";
import axios from "axios";
import { API } from "../../api";

/** Given a server URL, generates a fully formed path to the transfer cert
 * endpoint. */
const certUrl =
  () => `${API.current.baseUrl}/api/users/control_certificate`;

/** Encrypt an email/password pair in order to transfer control of a device to
 * a different user. */
export async function createTransferCert(input: TransferProps): Promise<string> {
  const { email, password } = input;
  const params = { email, password };
  const { data } = await axios.post<string>(certUrl(), params);
  return Promise.resolve(data);
}
