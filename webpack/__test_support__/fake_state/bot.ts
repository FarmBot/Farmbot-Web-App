import { Everything } from "../../interfaces";

export let bot: Everything["bot"] = {
  "consistent": true,
  "stepSize": 100,
  "controlPanelState": {
    "homing_and_calibration": false,
    "motors": false,
    "encoders_and_endstops": false,
    "danger_zone": false
  },
  "hardware": {
    "gpio_registry": {},
    "mcu_params": {
      encoder_enabled_x: 1,
      encoder_enabled_y: 1,
      encoder_enabled_z: 0
    },
    "jobs": {},
    "location_data": {
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
    "pins": {},
    "configuration": {},
    "informational_settings": {
      busy: false,
      locked: false,
      commit: "---",
      target: "---",
      env: "---"
    },
    "user_env": {},
    "process_info": {
      "farmwares": {}
    }
  },
  axis_inversion: {
    "x": false,
    "y": false,
    "z": false,
  },
  encoder_visibility: {
    "raw_encoders": false,
    "scaled_encoders": false,
  },
  "dirty": false,
  "currentOSVersion": "3.1.6"
};
