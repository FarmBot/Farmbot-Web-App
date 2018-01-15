import { NetworkState } from "./interfaces";
import { maybeGetDevice } from "../device";
import { store } from "../redux/store";

// const FRESHEN_STATE_TREE: RpcRequest = {
//   kind: "rpc_request",
//   args: { label: "FRESHEN_STATE_TREE" },
//   body: [{ kind: "read_status", args: {} }]
// };

const iDontLikeThis: { last: NetworkState } = { last: "down" };

store.subscribe(() => {
  const { state } =
    (store.getState().bot.connectivity["user.mqtt"] || { state: undefined });
  const device = maybeGetDevice();
  if (device && state && state !== iDontLikeThis.last) {
    device.readStatus();
    iDontLikeThis.last = state;
  }
});
