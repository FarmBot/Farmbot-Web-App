export interface Action {
    type:
    | "move_absolute"
    | "move_relative"
    | "move"
    | "toggle_pin"
    | "emergency_lock"
    | "emergency_unlock"
    | "find_home"
    | "go_to_home"
    | "send_message"
    | "update_device"
    | "print"
    | "wait_ms"
    | "write_pin"
    | "set_job_progress";
    args: (number | string | undefined)[];
}
