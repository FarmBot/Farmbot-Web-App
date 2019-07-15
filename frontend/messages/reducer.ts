import { AlertReducerState as State } from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { SyncBodyContents } from "../sync/actions";
import { TaggedResource } from "farmbot";
import { Actions } from "../constants";
import { ReduxAction } from "../redux/interfaces";

type Reducer =
  (state: State, fn: ReduxAction<TaggedResource>) => State;
const DEFAULT: Reducer =
  (s, a) => handleFbosConf(s, a.payload);
const FIRMWARE_MISSING =
  "farmbot_os.firmware.missing";

export const initialState: State = { alerts: {} };

const handleFbosConf =
  (s: State, resource: TaggedResource): State => {
    if (resource.kind === "FbosConfig") {
      if (resource.body.firmware_hardware) {
        delete s.alerts[FIRMWARE_MISSING];
      } else {
        s.alerts[FIRMWARE_MISSING] = {
          created_at: 1,
          problem_tag: FIRMWARE_MISSING,
          priority: 99999,
          slug: "firmware-missing",
        };
      }
    }

    return s;
  };

const pickConfigs = (x: TaggedResource) => x.kind === "FbosConfig";

export const alertsReducer =
  generateReducer<State>(initialState)
    .add<SyncBodyContents<TaggedResource>>(Actions.RESOURCE_READY, (s, a) => {
      const conf = a.payload.body.filter(pickConfigs)[0];

      return (conf) ? handleFbosConf(s, conf) : s;
    })
    .add<TaggedResource[]>(Actions.BATCH_INIT, (s, a) => {
      const conf = a.payload.filter(pickConfigs)[0];

      return conf ? handleFbosConf(s, conf) : s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, DEFAULT)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, DEFAULT)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_START, DEFAULT);
