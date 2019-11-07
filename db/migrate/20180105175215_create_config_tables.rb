class CreateConfigTables < ActiveRecord::Migration[5.1]

  def change
    create_table :firmware_configs do |t|
      t.references :device
      t.timestamps
      t.integer :encoder_enabled_x,                 default: 0
      t.integer :encoder_enabled_y,                 default: 0
      t.integer :encoder_enabled_z,                 default: 0
      t.integer :encoder_invert_x,                  default: 0
      t.integer :encoder_invert_y,                  default: 0
      t.integer :encoder_invert_z,                  default: 0
      t.integer :encoder_missed_steps_decay_x,      default: 5
      t.integer :encoder_missed_steps_decay_y,      default: 5
      t.integer :encoder_missed_steps_decay_z,      default: 5
      t.integer :encoder_missed_steps_max_x,        default: 5
      t.integer :encoder_missed_steps_max_y,        default: 5
      t.integer :encoder_missed_steps_max_z,        default: 5
      t.integer :encoder_scaling_x,                 default: 56
      t.integer :encoder_scaling_y,                 default: 56
      t.integer :encoder_scaling_z,                 default: 56
      t.integer :encoder_type_x,                    default: 0
      t.integer :encoder_type_y,                    default: 0
      t.integer :encoder_type_z,                    default: 0
      t.integer :encoder_use_for_pos_x,             default: 0
      t.integer :encoder_use_for_pos_y,             default: 0
      t.integer :encoder_use_for_pos_z,             default: 0
      t.integer :movement_axis_nr_steps_x,          default: 0
      t.integer :movement_axis_nr_steps_y,          default: 0
      t.integer :movement_axis_nr_steps_z,          default: 0
      t.integer :movement_enable_endpoints_x,       default: 0
      t.integer :movement_enable_endpoints_y,       default: 0
      t.integer :movement_enable_endpoints_z,       default: 0
      t.integer :movement_home_at_boot_x,           default: 0
      t.integer :movement_home_at_boot_y,           default: 0
      t.integer :movement_home_at_boot_z,           default: 0
      t.integer :movement_home_spd_x,               default: 50
      t.integer :movement_home_spd_y,               default: 50
      t.integer :movement_home_spd_z,               default: 50
      t.integer :movement_home_up_x,                default: 0
      t.integer :movement_home_up_y,                default: 0
      t.integer :movement_home_up_z,                default: 1
      t.integer :movement_invert_endpoints_x,       default: 0
      t.integer :movement_invert_endpoints_y,       default: 0
      t.integer :movement_invert_endpoints_z,       default: 0
      t.integer :movement_invert_motor_x,           default: 0
      t.integer :movement_invert_motor_y,           default: 0
      t.integer :movement_invert_motor_z,           default: 0
      t.integer :movement_keep_active_x,            default: 0
      t.integer :movement_keep_active_y,            default: 0
      t.integer :movement_keep_active_z,            default: 1
      t.integer :movement_max_spd_x,                default: 400
      t.integer :movement_max_spd_y,                default: 400
      t.integer :movement_max_spd_z,                default: 400
      t.integer :movement_min_spd_x,                default: 50
      t.integer :movement_min_spd_y,                default: 50
      t.integer :movement_min_spd_z,                default: 50
      t.integer :movement_secondary_motor_invert_x, default: 1
      t.integer :movement_secondary_motor_x,        default: 1
      t.integer :movement_step_per_mm_x,            default: 5
      t.integer :movement_step_per_mm_y,            default: 5
      t.integer :movement_step_per_mm_z,            default: 25
      t.integer :movement_steps_acc_dec_x,          default: 300
      t.integer :movement_steps_acc_dec_y,          default: 300
      t.integer :movement_steps_acc_dec_z,          default: 300
      t.integer :movement_stop_at_home_x,           default: 0
      t.integer :movement_stop_at_home_y,           default: 0
      t.integer :movement_stop_at_home_z,           default: 0
      t.integer :movement_stop_at_max_x,            default: 0
      t.integer :movement_stop_at_max_y,            default: 0
      t.integer :movement_stop_at_max_z,            default: 0
      t.integer :movement_timeout_x,                default: 120
      t.integer :movement_timeout_y,                default: 120
      t.integer :movement_timeout_z,                default: 120
      t.integer :param_config_ok,                   default: 0
      t.integer :param_e_stop_on_mov_err,           default: 0
      t.integer :param_mov_nr_retry,                default: 3
      t.integer :param_test,                        default: 0
      t.integer :param_use_eeprom,                  default: 1
      t.integer :param_version,                     default: 1
      t.integer :pin_guard_1_active_state,          default: 1
      t.integer :pin_guard_1_pin_nr,                default: 0
      t.integer :pin_guard_1_time_out,              default: 60
      t.integer :pin_guard_2_active_state,          default: 1
      t.integer :pin_guard_2_pin_nr,                default: 0
      t.integer :pin_guard_2_time_out,              default: 60
      t.integer :pin_guard_3_active_state,          default: 1
      t.integer :pin_guard_3_pin_nr,                default: 0
      t.integer :pin_guard_3_time_out,              default: 60
      t.integer :pin_guard_4_active_state,          default: 1
      t.integer :pin_guard_4_pin_nr,                default: 0
      t.integer :pin_guard_4_time_out,              default: 60
      t.integer :pin_guard_5_active_state,          default: 1
      t.integer :pin_guard_5_pin_nr,                default: 0
      t.integer :pin_guard_5_time_out,              default: 60
      t.integer :status_general,                    default: 0
    end

    create_table :web_app_configs do |t|
      t.references :device
      t.timestamps
      t.boolean :confirm_step_deletion,  default: false
      t.boolean :disable_animations,     default: false
      t.boolean :disable_i18n,           default: false
      t.boolean :display_trail,          default: false
      t.boolean :dynamic_map,            default: false
      t.boolean :encoder_figure,         default: false
      t.boolean :hide_webcam_widget,     default: false
      t.boolean :legend_menu_open,       default: false
      t.boolean :map_xl,                 default: false
      t.boolean :raw_encoders,           default: false
      t.boolean :scaled_encoders,        default: false
      t.boolean :show_spread,            default: false
      t.boolean :show_farmbot,           default: true
      t.boolean :show_plants,            default: true
      t.boolean :show_points,            default: true
      t.boolean :x_axis_inverted,        default: false
      t.boolean :y_axis_inverted,        default: false
      t.boolean :z_axis_inverted,        default: false
      t.integer :bot_origin_quadrant,    default: 2
      t.integer :zoom_level,             default: 1
      t.integer :success_log,            default: 1
      t.integer :busy_log,               default: 1
      t.integer :warn_log,               default: 1
      t.integer :error_log,              default: 1
      t.integer :info_log,               default: 1
      t.integer :fun_log,                default: 1
      t.integer :debug_log,              default: 1
      t.integer :successs_log,           default: 1
    end

    create_table :fbos_configs do |t|
      t.references :device
      t.timestamps
      t.boolean :auto_sync,                 default: false
      t.boolean :beta_opt_in,               default: false
      t.boolean :disable_factory_reset,     default: false
      t.boolean :firmware_input_log,        default: false
      t.boolean :firmware_output_log,       default: false
      t.boolean :sequence_body_log,         default: false
      t.boolean :sequence_complete_log,     default: false
      t.boolean :sequence_init_log,         default: false
      t.integer :arduino_debug_messages,    default: -99
      t.integer :network_not_found_timer
      t.integer :os_auto_update,            default: 0
      t.string  :firmware_hardware,         default: "arduino"
    end
  end
end
