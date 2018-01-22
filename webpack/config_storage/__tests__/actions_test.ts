import { toggleWebAppBool } from "../actions";
import { BooleanSetting } from "../../session_keys";
import { edit, save } from "../../api/crud";
import { getWebAppConfig } from "../../resources/selectors";

jest.mock("../../api/crud", () => {
  return { save: jest.fn(), edit: jest.fn() };
});

jest.mock("../../resources/selectors", () => {
  const conf = {
    kind: "WebAppConfig",
    body: {
      id: 2,
      device_id: 14,
      created_at: "2018-01-11T20:20:38.362Z",
      updated_at: "2018-01-22T15:32:41.970Z",
      confirm_step_deletion: false,
      disable_animations: false,
      disable_i18n: false,
      display_trail: false,
      dynamic_map: false,
      encoder_figure: false,
      hide_webcam_widget: false,
      legend_menu_open: false,
      map_xl: false,
      raw_encoders: true,
      scaled_encoders: true,
      show_spread: false,
      show_farmbot: true,
      show_plants: true,
      show_points: true,
      x_axis_inverted: false,
      y_axis_inverted: false,
      z_axis_inverted: true,
      bot_origin_quadrant: 2,
      zoom_level: -3,
      success_log: 3,
      busy_log: 3,
      warn_log: 3,
      error_log: 3,
      info_log: 3,
      fun_log: 3,
      debug_log: 3,
      stub_config: false,
      show_first_party_farmware: false
    },
    uuid: "WebAppConfig.2.1",
    specialStatus: ""
  };
  return { getWebAppConfig: jest.fn(() => (conf)) };
});

describe("toggleWebAppBool", () => {
  it("toggles things", () => {
    const action = toggleWebAppBool(BooleanSetting.show_first_party_farmware);
    const dispatch = jest.fn();
    const getState = jest.fn(() => ({ resources: { index: {} } }));
    action(dispatch, getState);
    const r = getWebAppConfig({} as any);
    const uuid = r ? r.uuid : "THIS IS BROKE";
    expect(edit).toHaveBeenCalledWith(r, { show_first_party_farmware: true });
    expect(save).toHaveBeenCalledWith(uuid);
  });
});
