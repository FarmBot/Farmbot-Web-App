import { TransferProps } from "./transfer_ownership";
import axios from "axios";
import { API } from "../../api";

/** Encrypt an email/password pair in order to transfer control of a device to
 * a different user. */
export async function createTransferCert(input: TransferProps): Promise<string> {
  const { email, password } = input;
  const params = { email, password };
  const { data } =
    await axios.post<string>(API.current.transferCertPath, params);
  return Promise.resolve(data);
}
