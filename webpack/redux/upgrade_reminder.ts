import { info } from "farmbot-toastr";

export function createReminderFn() {
  const state = { ready: true };

  return function reminder(version: string) {
    state.ready
      && semverCompare(version, "0.0.0")
      && info(Content.OLD_FBOS_REC_UPGRADE);
    state.ready = false;
  };
}
