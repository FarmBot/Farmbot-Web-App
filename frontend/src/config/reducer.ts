import { generateReducer } from "../redux/generate_reducer";
import { ChangeApiHost, ChangeApiPort, ConfigState } from "./interfaces";
import { API } from "../api";
import { Actions } from "../constants";

let initialState: ConfigState = {
  host: location.hostname,
  // It gets annoying to manually change the port # in dev mode.
  // I automatically point to port 3000 on local.
  port: API.inferPort()
};

export let configReducer = generateReducer<ConfigState>(initialState)
  .add<ChangeApiPort>(Actions.CHANGE_API_PORT, (s, { payload }) => {
    s.port = payload.port.replace(/\D/g, "");
    return s;
  })
  .add<ChangeApiHost>(Actions.CHANGE_API_HOST, (s, { payload }) => {
    s.host = payload.host;
    return s;
  });

