import { Xyz } from "farmbot";

export interface Action {
    type:
    | "move_absolute"
    | "animated_move_absolute"
    | "move_relative"
    | "move"
    | "_move"
    | "busy"
    | "toggle_pin"
    | "read_pin"
    | "sensor_reading"
    | "emergency_lock"
    | "emergency_unlock"
    | "find_home"
    | "go_to_home"
    | "send_message"
    | "take_photo"
    | "calibrate_camera"
    | "detect_weeds"
    | "measure_soil_height"
    | "update_device"
    | "create_point"
    | "print"
    | "wait_ms"
    | "write_pin"
    | "set_job_progress";
    args: (number | string | undefined)[];
}

export type XyzNumber = Record<Xyz, number>;
