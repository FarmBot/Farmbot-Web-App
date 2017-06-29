
import { Everything } from "../../interfaces";

export let bot: Everything["bot"] = {
  "stepSize": 100,
  "controlPanelState": {
    "homing_and_calibration": false,
    "motors": false,
    "encoders_and_endstops": false,
    "danger_zone": false
  },
  "hardware": {
    "mcu_params": {},
    "location": [
      -1,
      -1,
      -1
    ],
    "pins": {},
    "configuration": {},
    "informational_settings": {},
    "user_env": {},
    "process_info": {
      "farmwares": {}
    }
  },
  "x_axis_inverted": false,
  "y_axis_inverted": false,
  "z_axis_inverted": false,
  "dirty": false,
  "currentOSVersion": "3.1.6"
};
