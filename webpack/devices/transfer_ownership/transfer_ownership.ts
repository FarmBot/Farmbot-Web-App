import { Farmbot, toPairs, rpcRequest } from "farmbot";
import { createTransferCert } from "./create_transfer_cert";

export interface TransferProps {
  email: string;
  password: string;
  server: string;
  device: Farmbot;
}

/** Pass control of your device over to another user. */
export async function transferOwnership(input: TransferProps): Promise<void> {
  const { email, server, device } = input;
  const secret = await createTransferCert(input);
  const body = toPairs({ email, server, secret });
  await device.send(rpcRequest([{ kind: "change_ownership", args: {}, body }]));
  return Promise.resolve();
}
