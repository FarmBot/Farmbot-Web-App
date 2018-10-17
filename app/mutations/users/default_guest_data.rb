{
  tools: {
    -1 => "Weeder",
    -2 => "Seeder",
    -3 => "Watering Nozzle",
    -4 => "Seed Bin",
    -5 => "Seed Tray",
    -6 => "Soil Sensor"
  },
  device: {
    name: "My FarmBot",
    timezone: "UTC",
    fbos_version: "6.4.11",
    mounted_tool_id: nil
  },
  fbos_config: {
    auto_sync: false,
    beta_opt_in: false,
    disable_factory_reset: false,
    firmware_input_log: false,
    firmware_output_log: false,
    sequence_body_log: false,
    sequence_complete_log: false,
    sequence_init_log: false,
    network_not_found_timer: nil,
    firmware_hardware: "farmduino_k14",
    api_migrated: true,
    os_auto_update: true,
    arduino_debug_messages: false
  },
  firmware_config: {
    encoder_enabled_x: 1,
    encoder_enabled_y: 1,
    encoder_enabled_z: 1,
    encoder_invert_x: 0,
    encoder_invert_y: 0,
    encoder_invert_z: 0,
    encoder_missed_steps_decay_x: 5,
    encoder_missed_steps_decay_y: 5,
    encoder_missed_steps_decay_z: 5,
    encoder_missed_steps_max_x: 5,
    encoder_missed_steps_max_y: 5,
    encoder_missed_steps_max_z: 5,
    encoder_scaling_x: 5556,
    encoder_scaling_y: 5556,
    encoder_scaling_z: 5556,
    encoder_type_x: 0,
    encoder_type_y: 0,
    encoder_type_z: 0,
    encoder_use_for_pos_x: 1,
    encoder_use_for_pos_y: 1,
    encoder_use_for_pos_z: 1,
    movement_axis_nr_steps_x: 14500,
    movement_axis_nr_steps_y: 7000,
    movement_axis_nr_steps_z: 20000,
    movement_enable_endpoints_x: 0,
    movement_enable_endpoints_y: 0,
    movement_enable_endpoints_z: 0,
    movement_home_at_boot_x: 0,
    movement_home_at_boot_y: 0,
    movement_home_at_boot_z: 0,
    movement_home_spd_x: 50,
    movement_home_spd_y: 50,
    movement_home_spd_z: 50,
    movement_home_up_x: 0,
    movement_home_up_y: 0,
    movement_home_up_z: 1,
    movement_invert_endpoints_x: 0,
    movement_invert_endpoints_y: 0,
    movement_invert_endpoints_z: 0,
    movement_invert_motor_x: 0,
    movement_invert_motor_y: 0,
    movement_invert_motor_z: 0,
    movement_keep_active_x: 1,
    movement_keep_active_y: 1,
    movement_keep_active_z: 1,
    movement_max_spd_x: 400,
    movement_max_spd_y: 400,
    movement_max_spd_z: 400,
    movement_min_spd_x: 50,
    movement_min_spd_y: 50,
    movement_min_spd_z: 50,
    movement_secondary_motor_invert_x: 1,
    movement_secondary_motor_x: 1,
    movement_step_per_mm_x: 5.0,
    movement_step_per_mm_y: 5.0,
    movement_step_per_mm_z: 25.0,
    movement_steps_acc_dec_x: 300,
    movement_steps_acc_dec_y: 300,
    movement_steps_acc_dec_z: 300,
    movement_stop_at_home_x: 1,
    movement_stop_at_home_y: 1,
    movement_stop_at_home_z: 1,
    movement_stop_at_max_x: 1,
    movement_stop_at_max_y: 1,
    movement_stop_at_max_z: 1,
    movement_timeout_x: 120,
    movement_timeout_y: 120,
    movement_timeout_z: 120,
    param_config_ok: 0,
    param_e_stop_on_mov_err: 1,
    param_mov_nr_retry: 3,
    param_test: 0,
    param_use_eeprom: 1,
    param_version: 1,
    pin_guard_1_active_state: 1,
    pin_guard_1_pin_nr: 7,
    pin_guard_1_time_out: 60,
    pin_guard_2_active_state: 1,
    pin_guard_2_pin_nr: 8,
    pin_guard_2_time_out: 60,
    pin_guard_3_active_state: 1,
    pin_guard_3_pin_nr: 9,
    pin_guard_3_time_out: 60,
    pin_guard_4_active_state: 1,
    pin_guard_4_pin_nr: 10,
    pin_guard_4_time_out: 60,
    pin_guard_5_active_state: 1,
    pin_guard_5_pin_nr: 12,
    pin_guard_5_time_out: 60,
    api_migrated: true,
    movement_invert_2_endpoints_x: 0,
    movement_invert_2_endpoints_y: 0,
    movement_invert_2_endpoints_z: 0
  },
  web_app_config: {
    confirm_step_deletion: true,
    disable_animations: false,
    disable_i18n: false,
    display_trail: false,
    dynamic_map: false,
    encoder_figure: false,
    hide_webcam_widget: false,
    legend_menu_open: true,
    map_xl: false,
    raw_encoders: false,
    scaled_encoders: false,
    show_spread: false,
    show_farmbot: true,
    show_plants: true,
    show_points: true,
    x_axis_inverted: false,
    y_axis_inverted: false,
    z_axis_inverted: false,
    bot_origin_quadrant: 2,
    zoom_level: -5,
    success_log: 1,
    busy_log: 1,
    warn_log: 1,
    error_log: 1,
    info_log: 1,
    fun_log: 1,
    debug_log: 1,
    stub_config: false,
    show_first_party_farmware: false,
    enable_browser_speak: false,
    show_images: false,
    photo_filter_begin: nil,
    photo_filter_end: nil,
    discard_unsaved: true,
    xy_swap: false,
    home_button_homing: false,
    show_motor_plot: false,
    show_historic_points: false
  },
  points: [
    {
      name: "Spinach",
      pointer_type: "Plant",
      x: 1900,
      y: 1000,
      z: 0,
      openfarm_slug: "spinach",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Bok Choy",
      pointer_type: "Plant",
      x: 2660,
      y: 130,
      z: 0,
      openfarm_slug: "bok-choy",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Bok Choy",
      pointer_type: "Plant",
      x: 2350,
      y: 390,
      z: 0,
      openfarm_slug: "bok-choy",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Lettuce",
      pointer_type: "Plant",
      x: 900,
      y: 260,
      z: 0,
      openfarm_slug: "lettuce",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1750,
      y: 390,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Pumpkin",
      pointer_type: "Plant",
      x: 2000,
      y: 1250,
      z: 0,
      openfarm_slug: "pumpkin",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Pumpkin",
      pointer_type: "Plant",
      x: 1500,
      y: 1250,
      z: 0,
      openfarm_slug: "pumpkin",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Pumpkin",
      pointer_type: "Plant",
      x: 500,
      y: 1250,
      z: 0,
      openfarm_slug: "pumpkin",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Beets",
      pointer_type: "Plant",
      x: 2650,
      y: 830,
      z: 0,
      openfarm_slug: "beets",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Beets",
      pointer_type: "Plant",
      x: 2350,
      y: 830,
      z: 0,
      openfarm_slug: "beets",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Cabbage",
      pointer_type: "Plant",
      x: 530,
      y: 850,
      z: 0,
      openfarm_slug: "cabbage",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 1600,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 460,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 670,
      y: 370,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 390,
      y: 370,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Bok Choy",
      pointer_type: "Plant",
      x: 2350,
      y: 130,
      z: 0,
      openfarm_slug: "bok-choy",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Lettuce",
      pointer_type: "Plant",
      x: 2050,
      y: 260,
      z: 0,
      openfarm_slug: "lettuce",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1190,
      y: 350,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Pumpkin",
      pointer_type: "Plant",
      x: 2500,
      y: 1250,
      z: 0,
      openfarm_slug: "pumpkin",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Pumpkin",
      pointer_type: "Plant",
      x: 1000,
      y: 1250,
      z: 0,
      openfarm_slug: "pumpkin",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Cabbage",
      pointer_type: "Plant",
      x: 1050,
      y: 850,
      z: 0,
      openfarm_slug: "cabbage",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 1900,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 1180,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 660,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 390,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 600,
      y: 370,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 460,
      y: 370,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Bok Choy",
      pointer_type: "Plant",
      x: 2650,
      y: 400,
      z: 0,
      openfarm_slug: "bok-choy",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1750,
      y: 130,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1450,
      y: 130,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1450,
      y: 390,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Arugula",
      pointer_type: "Plant",
      x: 1150,
      y: 130,
      z: 0,
      openfarm_slug: "arugula",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Beets",
      pointer_type: "Plant",
      x: 2050,
      y: 830,
      z: 0,
      openfarm_slug: "beets",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Beets",
      pointer_type: "Plant",
      x: 1750,
      y: 830,
      z: 0,
      openfarm_slug: "beets",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Cabbage",
      pointer_type: "Plant",
      x: 1450,
      y: 830,
      z: 0,
      openfarm_slug: "cabbage",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Cabbage",
      pointer_type: "Plant",
      x: 790,
      y: 850,
      z: 0,
      openfarm_slug: "cabbage",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 2800,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 2500,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 2200,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 920,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Broccoli",
      pointer_type: "Plant",
      x: 400,
      y: 630,
      z: 0,
      openfarm_slug: "broccoli",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 670,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 600,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 530,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Purple Carrot",
      pointer_type: "Plant",
      x: 320,
      y: 290,
      z: 0,
      openfarm_slug: "purple-carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 320,
      y: 370,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Carrot",
      pointer_type: "Plant",
      x: 530,
      y: 372,
      z: 0,
      openfarm_slug: "carrot",
      plant_stage: "planned",
      planted_at: nil,
      radius: 25.0
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 200.0,
      z: -500.0,
      tool_id: -5,
      pullout_direction: 1
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 600.0,
      z: -500.0,
      tool_id: -3,
      pullout_direction: 1
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 700.0,
      z: -500.0-6,
      pullout_direction: 1
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 500.0,
      z: -500.0,
      tool_id: -4,
      pullout_direction: 1
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 300.0,
      z: -500.0,
      tool_id: -2,
      pullout_direction: 1
    },
    {
      name: "Tool Slot",
      pointer_type: "ToolSlot",
      x: 100.0,
      y: 100.0,
      z: -500.0,
      tool_id: -1,
      pullout_direction: 1
    }
  ],
  farm_events: [
    {
      start_time: "2018-10-16T00:00:00.000Z",
      end_time: "2018-10-16T00:01:00.000Z",
      repeat: 1,
      time_unit: "never",
      executable_id: 205,
      executable_type: "Regimen",
      calendar: []
    }
  ],
  images: {
    attachment_url: "https://i.imgur.com/8pGjQtT.jpg",
    meta: {
      x: 500.0,
      y: 500.0,
      z: 0.0
    }
  },
  logs: [
    {
      message: "Configuring Farmbot.",
      meta: {
        type: "busy",
        major_version: 6,
        minor_version: 4,
        verbosity: 3,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "busy",
      verbosity: 3,
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    {
      message: "Starting Networking.",
      meta: {
        type: "info",
        major_version: 6,
        minor_version: 4,
        verbosity: 3,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "info",
      verbosity: 3,
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    {
      message: "Initializing Firmware.",
      meta: {
        type: "busy",
        major_version: 6,
        minor_version: 4,
        verbosity: 1,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "busy",
      verbosity: 1,
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    {
      message: "Farmbot is up and running!",
      meta: {
        type: "success",
        major_version: 6,
        minor_version: 4,
        verbosity: 1,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "success",
      verbosity: 1,
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    {
      message: "Syncing",
      meta: {
        type: "busy",
        major_version: 6,
        minor_version: 4,
        verbosity: 1,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "busy",
      verbosity: 1,
      x: 0.0,
      y: 0.0,
      z: 0.0
    },
    {
      message: "Synced",
      meta: {
        type: "success",
        major_version: 6,
        minor_version: 4,
        verbosity: 1,
        x: 0.0,
        y: 0.0,
        z: 0.0
      },
      major_version: 6,
      minor_version: 4,
      type: "success",
      verbosity: 1,
      x: 0.0,
      y: 0.0,
      z: 0.0
    }
  ],
  peripherals: [
    {
      pin: 7,
      label: "Lighting",
      mode: 0
    },
    {
      pin: 8,
      label: "Water",
      mode: 0
    },
    {
      pin: 9,
      label: "Vacuum",
      mode: 0
    },
    {
      pin: 10,
      label: "Peripheral 4",
      mode: 0
    },
    {
      pin: 12,
      label: "Peripheral 5",
      mode: 0
    }
  ],
  pin_bindings: [
    {
      sequence_id: nil,
      special_action: "emergency_lock",
      pin_num: 16,
    },
    {
      sequence_id: nil,
      special_action: "emergency_unlock",
      pin_num: 22,
    },
    {
      sequence_id: nil,
      special_action: "take_photo",
      pin_num: 26,
    }
  ],
  regimens: [
    {
      name: "Spinach Plant Care",
      color: "green",
      in_use: true,
      regimen_items: [
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5994000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5907600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5821200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5734800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5648400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5562000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5475600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5389200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5302800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5216400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5130000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 5043600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4957200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4870800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4784400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4698000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4611600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4525200000
        },
        {
          regimen_id: 205,
          sequence_id: 304800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4352400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4266000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4179600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4093200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 4006800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3920400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3834000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3747600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3661200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3574800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3488400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3402000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3315600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3229200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3142800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 3056400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2970000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2883600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2797200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2710800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2624400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2538000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2451600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2365200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2278800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2192400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2106000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 2019600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1933200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1846800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1760400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1674000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1587600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1501200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1414800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1328400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1242000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1155600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 1069200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 982800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 896400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 810000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 723600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 637200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 550800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 464400000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 378000000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 291600000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 205200000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 118800000
        },
        {
          regimen_id: 205,
          sequence_id: 3048,
          time_offset: 32400000
        },
        {
          regimen_id: 205,
          sequence_id: 3043,
          time_offset: 28800000
        }
      ]
    }
  ],
  sensors: [
    {
      pin: 63,
      label: "Tool Verification",
      mode: 0
    },
    {
      pin: 59,
      label: "Soil Moisture",
      mode: 1
    }
  ],
  sequences: [
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "blue",
      name: "Water spinach",
      kind: "sequence",
      body: [
        {
          kind: "execute",
          args: {
            sequence_id: 3044
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "point",
              args: {
                pointer_id: 21908,
                pointer_type: "Plant"
              }
            }
          }
        },
        {
          kind: "execute",
          args: {
            sequence_id: 3045
          }
        },
        {
          kind: "execute",
          args: {
            sequence_id: 3047
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "purple",
      name: "Unmount watering nozzle",
      kind: "sequence",
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 100,
                y: 0,
                z: 100
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 100,
                y: 0,
                z: 0
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: 0
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: 100
              }
            }
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "orange",
      name: "Unmount seeder",
      kind: "sequence",
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "pink",
      name: "Light Watering",
      kind: "sequence",
      body: [
        {
          kind: "write_pin",
          args: {
            pin_value: 1,
            pin_mode: 0,
            pin_number: {
              kind: "named_pin",
              args: {
                pin_type: "Peripheral",
                pin_id: 425
              }
            }
          }
        },
        {
          kind: "wait",
          args: {
            milliseconds: 5000
          }
        },
        {
          kind: "write_pin",
          args: {
            pin_value: 0,
            pin_mode: 0,
            pin_number: {
              kind: "named_pin",
              args: {
                pin_type: "Peripheral",
                pin_id: 425
              }
            }
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "purple",
      name: "Mount Watering Nozzle",
      kind: "sequence",
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -3
              }
            }
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "green",
      name: "Plant Spinach",
      kind: "sequence",
      body: [
        {
          kind: "execute",
          args: {
            sequence_id: 3040
          }
        },
        {
          kind: "execute",
          args: {
            sequence_id: 3041
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "point",
              args: {
                pointer_type: "Plant",
                pointer_id: 21908
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: -700
              }
            }
          }
        },
        {
          kind: "write_pin",
          args: {
            pin_value: 0,
            pin_mode: 0,
            pin_number: {
              kind: "named_pin",
              args: {
                pin_type: "Peripheral",
                pin_id: 426
              }
            }
          }
        },
        {
          kind: "move_relative",
          args: {
            x: 0,
            y: 0,
            z: 100,
            speed: 100
          }
        },
        {
          kind: "execute",
          args: {
            sequence_id: 3046
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "yellow",
      name: "Pick up seed",
      kind: "sequence",
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -4
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: 100
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -4
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: 0
              }
            }
          }
        },
        {
          kind: "write_pin",
          args: {
            pin_mode: 0,
            pin_value: 1,
            pin_number: {
              kind: "named_pin",
              args: {
                pin_id: 426,
                pin_type: "Peripheral"
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            location: {
              kind: "tool",
              args: {
                tool_id: -4
              }
            },
            offset: {
              kind: "coordinate",
              args: {
                x: 0,
                y: 0,
                z: 100
              }
            }
          }
        }
      ],
      in_use: true
    },
    {
      args: {
        version: 20180209,
        locals: {
          kind: "scope_declaration",
          args: {}
        }
      },
      color: "orange",
      name: "Mount seeder",
      kind: "sequence",
      body: [
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 0
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 0,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        },
        {
          kind: "move_absolute",
          args: {
            speed: 100,
            offset: {
              kind: "coordinate",
              args: {
                z: 100,
                y: 0,
                x: 100
              }
            },
            location: {
              kind: "tool",
              args: {
                tool_id: -2
              }
            }
          }
        }
      ],
      in_use: true
    }
  ],
  user: { name: "FarmBot", agree_to_terms: true },
  webcam_feed: {
      url: "https://scontent-sjc3-1.cdninstagram.com/vp/beb0c90dbfcc5652b9b752c0ae62cec5/5C3FCF2D/t51.2885-15/sh0.08/e35/s640x640/41334547_333667650717095_8130819691118984488_n.jpg",
      name: "My FarmBot"
    }
}
