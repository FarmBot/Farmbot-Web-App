import {
  BotState,
  HardwareState,
  MinOsFeatureLookup,
  OsUpdateInfo,
} from "./interfaces";
import { generateReducer } from "../redux/generate_reducer";
import { Actions } from "../constants";
import { maybeNegateStatus } from "../connectivity/maybe_negate_status";
import { ReduxAction } from "../redux/interfaces";
import {
  connectivityReducer, PingResultPayload, recentPingOk,
} from "../connectivity/reducer";
import { versionOK } from "../util";

const afterEach = (state: BotState, a: ReduxAction<{}>) => {
  state.connectivity = connectivityReducer(state.connectivity, a);
  return state;
};

export const initialState = (): BotState => ({
  consistent: true,
  stepSize: 100,
  hardware: {
    gpio_registry: {},
    mcu_params: {},
    jobs: {},
    location_data: {
      "position": {
        x: undefined,
        y: undefined,
        z: undefined
      },
      "scaled_encoders": {
        x: undefined,
        y: undefined,
        z: undefined
      },
      "raw_encoders": {
        x: undefined,
        y: undefined,
        z: undefined
      },
    },
    pins: {},
    configuration: {},
    informational_settings: {
      busy: false,
      locked: false,
      commit: "---",
      target: "---",
      env: "---",
      node_name: "---",
      firmware_version: "---",
      firmware_commit: "---",
    },
    user_env: {},
    process_info: {
      farmwares: {},
    }
  },
  dirty: false,
  osUpdateVersion: undefined,
  minOsFeatureData: undefined,
  osReleaseNotes: undefined,
  connectivity: {
    uptime: {
      "bot.mqtt": undefined,
      "user.mqtt": undefined,
      "user.api": undefined
    },
    pings: {}
  },
  needVersionCheck: true,
  alreadyToldUserAboutMalformedMsg: false,
});

export const botReducer = generateReducer<BotState>(initialState())
  .afterEach(afterEach)
  .add<boolean>(Actions.SET_CONSISTENCY, (s, a) => {
    s.consistent = a.payload;
    s.hardware.informational_settings.sync_status = maybeNegateStatus({
      consistent: s.consistent,
      syncStatus: s.hardware.informational_settings.sync_status,
      fbosVersion: s.hardware.informational_settings.controller_version,
    });
    return s;
  })
  .add<void>(Actions.SETTING_UPDATE_START, (s) => {
    s.isUpdating = true;
    return s;
  })
  .add<void>(Actions.SETTING_UPDATE_END, (s) => {
    s.isUpdating = false;
    return s;
  })
  .add<number>(Actions.CHANGE_STEP_SIZE, (s, a) => {
    return Object.assign({}, s, {
      stepSize: a.payload
    });
  })
  .add<OsUpdateInfo>(Actions.FETCH_OS_UPDATE_INFO_OK, (s, { payload }) => {
    s.osUpdateVersion = payload.version;
    return s;
  })
  .add<MinOsFeatureLookup>(Actions.FETCH_MIN_OS_FEATURE_INFO_OK,
    (s, { payload }) => {
      s.minOsFeatureData = payload;
      return s;
    })
  .add<string>(Actions.FETCH_OS_RELEASE_NOTES_OK,
    (s, { payload }) => {
      s.osReleaseNotes = payload;
      return s;
    })
  .add<HardwareState>(Actions.STATUS_UPDATE, statusHandler)
  .add<void>(Actions.STASH_STATUS, (s) => {
    stash(s);
    return s;
  })
  .add<boolean>(Actions.SET_NEEDS_VERSION_CHECK, (s, { payload }) => {
    s.needVersionCheck = payload;
    return s;
  })
  .add<boolean>(Actions.SET_MALFORMED_NOTIFICATION_SENT, (s, { payload }) => {
    s.alreadyToldUserAboutMalformedMsg = payload;
    return s;
  })
  .add<void>(Actions._RESOURCE_NO, (s) => {
    unstash(s);
    return s;
  })
  .add<PingResultPayload>(Actions.PING_OK, (s) => {
    // Going from "down" to "up"
    const currentState = s.connectivity.uptime["bot.mqtt"];
    const backOnline = currentState && currentState.state === "down";
    backOnline && unstash(s);
    return s;
  })
  .add<PingResultPayload>(Actions.PING_NO, (s, { payload }) => {
    if (!recentPingOk(s.connectivity.pings, payload.id)) {
      stash(s);
      s.hardware.informational_settings.sync_status = undefined;
    }
    return s;
  });

/** Mutate syncStatus when transitioning from consistent to inconsistent. */
const stash = (s: BotState) => {
  const botStatus = s.hardware.informational_settings.sync_status;
  botStatus && (s.statusStash = botStatus);
};

/** Put the old syncStatus back where it was after bot becomes consistent. */
const unstash = (s: BotState) =>
  s.hardware.informational_settings.sync_status = s.statusStash;

function statusHandler(state: BotState,
  action: ReduxAction<HardwareState>): BotState {
  const { payload } = action;
  state.hardware = payload;
  const { informational_settings } = state.hardware;
  const syncStatus = informational_settings.sync_status;
  /** USE CASE: You reboot the bot. The old state values are still hanging
   * around. You think the bot is broke, but it isn't. The FE is holding on
   * to stale data. */
  if (syncStatus === "maintenance") {
    const emptyState = initialState();
    state.hardware = emptyState.hardware;
    state.hardware.informational_settings.sync_status = "maintenance";
    return state;
  }

  const info = {
    consistent: state.consistent,
    syncStatus,
    fbosVersion: informational_settings.controller_version,
  };
  state.consistent = info.consistent;
  info.consistent = state.consistent;

  const nextSyncStatus = maybeNegateStatus(info);

  versionOK(informational_settings.controller_version);
  state.hardware.informational_settings.sync_status = nextSyncStatus;
  return state;
}
