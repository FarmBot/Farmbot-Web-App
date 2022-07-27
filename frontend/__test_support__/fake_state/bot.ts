import { Everything } from "../../interfaces";

export const bot: Everything["bot"] = {
  consistent: true,
  stepSize: 100,
  hardware: {
    gpio_registry: {},
    mcu_params: {
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 0
    },
    jobs: {},
    location_data: {
      position: {
        x: undefined,
        y: undefined,
        z: undefined
      },
      scaled_encoders: {
        x: undefined,
        y: undefined,
        z: undefined
      },
      raw_encoders: {
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
      controller_uuid: "123",
      target: "---",
      env: "---",
      node_name: "---",
      firmware_commit: "---",
    },
    user_env: {},
    process_info: {
      farmwares: {}
    }
  },
  dirty: false,
  osUpdateVersion: "3.1.6",
  connectivity: {
    uptime: {
      "bot.mqtt": undefined,
      "user.mqtt": undefined,
      "user.api": undefined,
    },
    pings: {}
  },
  needVersionCheck: true,
  alreadyToldUserAboutMalformedMsg: false,
};
