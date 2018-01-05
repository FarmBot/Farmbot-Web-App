class ConfigSchema
  # I wish Ruby ackowledged that TrueClass/FalseClass are related
  class Boolean; end

  def self.all
    @all ||= HashWithIndifferentAccess.new({})
  end

  def self.defaults
    all.values.map(&:to_a).to_h
  end

  def self.call(name, default, &validator)
    kind = default.class
    all[name] = self.new({
      name: name,
      default: default,
      kind: [TrueClass, FalseClass].include?(kind) ? Boolean : kind,
      validator: validator || nil
    })
  end

  attr_reader :name, :default, :kind, :validator
  def initialize(name:, default:, kind:, validator: nil)
    @name = name
    @default = default
    @kind = kind
    @validator = validator
  end

  def to_a
    [self.name, self.default]
  end

  ConfigSchema.(:arduino_debug_messages, -99)
  ConfigSchema.(:auto_sync, true)
  ConfigSchema.(:bot_origin_quadrant, -99)
  ConfigSchema.(:busy_log, -99)
  ConfigSchema.(:confirm_step_deletion, true)
  ConfigSchema.(:debug_log, -99)
  ConfigSchema.(:disable_factory_reset, true)
  ConfigSchema.(:disable_animations, true)
  ConfigSchema.(:disable_i18n, true)
  ConfigSchema.(:display_trail, true)
  ConfigSchema.(:dynamic_map, true)
  ConfigSchema.(:encoder_enabled_x, -99)
  ConfigSchema.(:encoder_enabled_y, -99)
  ConfigSchema.(:encoder_enabled_z, -99)
  ConfigSchema.(:encoder_invert_x, -99)
  ConfigSchema.(:encoder_invert_y, -99)
  ConfigSchema.(:encoder_invert_z, -99)
  ConfigSchema.(:encoder_missed_steps_decay_x, -99)
  ConfigSchema.(:encoder_missed_steps_decay_y, -99)
  ConfigSchema.(:encoder_missed_steps_decay_z, -99)
  ConfigSchema.(:encoder_missed_steps_max_x, -99)
  ConfigSchema.(:encoder_missed_steps_max_y, -99)
  ConfigSchema.(:encoder_missed_steps_max_z, -99)
  ConfigSchema.(:encoder_scaling_x, -99)
  ConfigSchema.(:encoder_scaling_y, -99)
  ConfigSchema.(:encoder_scaling_z, -99)
  ConfigSchema.(:encoder_type_x, -99)
  ConfigSchema.(:encoder_type_y, -99)
  ConfigSchema.(:encoder_type_z, -99)
  ConfigSchema.(:encoder_use_for_pos_x, -99)
  ConfigSchema.(:encoder_use_for_pos_y, -99)
  ConfigSchema.(:encoder_use_for_pos_z, -99)
  ConfigSchema.(:encoder_figure, true)
  ConfigSchema.(:error_log, -99)
  ConfigSchema.(:firmware_input_log, true)
  ConfigSchema.(:firmware_output_log, true)
  ConfigSchema.(:fun_log, -99)
  ConfigSchema.(:fw_auto_update, -99)
  ConfigSchema.(:hide_webcam_widget, true)
  ConfigSchema.(:info_log, -99)
  ConfigSchema.(:legend_menu_open, true)
  ConfigSchema.(:map_xl, true)
  ConfigSchema.(:movement_axis_nr_steps_x, -99)
  ConfigSchema.(:movement_axis_nr_steps_y, -99)
  ConfigSchema.(:movement_axis_nr_steps_z, -99)
  ConfigSchema.(:movement_enable_endpoints_x, -99)
  ConfigSchema.(:movement_enable_endpoints_y, -99)
  ConfigSchema.(:movement_enable_endpoints_z, -99)
  ConfigSchema.(:movement_home_at_boot_x, -99)
  ConfigSchema.(:movement_home_at_boot_y, -99)
  ConfigSchema.(:movement_home_at_boot_z, -99)
  ConfigSchema.(:movement_home_spd_x, -99)
  ConfigSchema.(:movement_home_spd_y, -99)
  ConfigSchema.(:movement_home_spd_z, -99)
  ConfigSchema.(:movement_home_up_x, -99)
  ConfigSchema.(:movement_home_up_y, -99)
  ConfigSchema.(:movement_home_up_z, -99)
  ConfigSchema.(:movement_invert_endpoints_x, -99)
  ConfigSchema.(:movement_invert_endpoints_y, -99)
  ConfigSchema.(:movement_invert_endpoints_z, -99)
  ConfigSchema.(:movement_invert_motor_x, -99)
  ConfigSchema.(:movement_invert_motor_y, -99)
  ConfigSchema.(:movement_invert_motor_z, -99)
  ConfigSchema.(:movement_keep_active_x, -99)
  ConfigSchema.(:movement_keep_active_y, -99)
  ConfigSchema.(:movement_keep_active_z, -99)
  ConfigSchema.(:movement_max_spd_x, -99)
  ConfigSchema.(:movement_max_spd_y, -99)
  ConfigSchema.(:movement_max_spd_z, -99)
  ConfigSchema.(:movement_min_spd_x, -99)
  ConfigSchema.(:movement_min_spd_y, -99)
  ConfigSchema.(:movement_min_spd_z, -99)
  ConfigSchema.(:movement_secondary_motor_invert_x, -99)
  ConfigSchema.(:movement_secondary_motor_x, -99)
  ConfigSchema.(:movement_step_per_mm_x, -99)
  ConfigSchema.(:movement_step_per_mm_y, -99)
  ConfigSchema.(:movement_step_per_mm_z, -99)
  ConfigSchema.(:movement_steps_acc_dec_x, -99)
  ConfigSchema.(:movement_steps_acc_dec_y, -99)
  ConfigSchema.(:movement_steps_acc_dec_z, -99)
  ConfigSchema.(:movement_stop_at_home_x, -99)
  ConfigSchema.(:movement_stop_at_home_y, -99)
  ConfigSchema.(:movement_stop_at_home_z, -99)
  ConfigSchema.(:movement_stop_at_max_x, -99)
  ConfigSchema.(:movement_stop_at_max_y, -99)
  ConfigSchema.(:movement_stop_at_max_z, -99)
  ConfigSchema.(:movement_timeout_x, -99)
  ConfigSchema.(:movement_timeout_y, -99)
  ConfigSchema.(:movement_timeout_z, -99)
  ConfigSchema.(:network_not_found_timer, -99)
  ConfigSchema.(:os_auto_update, -99)
  ConfigSchema.(:param_e_stop_on_mov_err, -99)
  ConfigSchema.(:param_mov_nr_retry, -99)
  ConfigSchema.(:param_version, -99)
  ConfigSchema.(:pin_guard_1_active_state, -99)
  ConfigSchema.(:pin_guard_1_pin_nr, -99)
  ConfigSchema.(:pin_guard_1_time_out, -99)
  ConfigSchema.(:pin_guard_2_active_state, -99)
  ConfigSchema.(:pin_guard_2_pin_nr, -99)
  ConfigSchema.(:pin_guard_2_time_out, -99)
  ConfigSchema.(:pin_guard_3_active_state, -99)
  ConfigSchema.(:pin_guard_3_pin_nr, -99)
  ConfigSchema.(:pin_guard_3_time_out, -99)
  ConfigSchema.(:pin_guard_4_active_state, -99)
  ConfigSchema.(:pin_guard_4_pin_nr, -99)
  ConfigSchema.(:pin_guard_4_time_out, -99)
  ConfigSchema.(:pin_guard_5_active_state, -99)
  ConfigSchema.(:pin_guard_5_pin_nr, -99)
  ConfigSchema.(:pin_guard_5_time_out, -99)
  ConfigSchema.(:raw_encoders, true)
  ConfigSchema.(:scaled_encoders, true)
  ConfigSchema.(:sequence_body_log, true)
  ConfigSchema.(:sequence_complete_log, true)
  ConfigSchema.(:sequence_init_log, true)
  ConfigSchema.(:show_farmbot, true)
  ConfigSchema.(:show_plants, true)
  ConfigSchema.(:show_points, true)
  ConfigSchema.(:show_spread, true)
  ConfigSchema.(:steps_per_mm_x, -99)
  ConfigSchema.(:steps_per_mm_y, -99)
  ConfigSchema.(:steps_per_mm_z, -99)
  ConfigSchema.(:success_log, -99)
  ConfigSchema.(:successs_log, -99)
  ConfigSchema.(:warn_log, -99)
  ConfigSchema.(:weed_detector, true)
  ConfigSchema.(:x_axis_inverted, true)
  ConfigSchema.(:y_axis_inverted, true)
  ConfigSchema.(:z_axis_inverted, true)
  ConfigSchema.(:zoom_level, -99)
  ConfigSchema.(:firmware_hardware, "arduino") do |value|
    all = ["arduino", "farmduino"]
    "`firmware_hardware` must be of of: " + all.join(", ") if all.include?(value)
  end
end
