import { TransferProps } from "./transfer_ownership";
import axios from "axios";

const certUrl = (server: string) => `${server}/api/users/control_certificate`;

export async function createTransferCert(input: TransferProps): Promise<string> {
  const { server, email, password } = input;
  const { data } =
    await axios.post<string>(certUrl(server), { email, password });
  return Promise.resolve(data);
}
