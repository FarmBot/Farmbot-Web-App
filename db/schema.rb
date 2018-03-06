# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180306195021) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "delayed_jobs", id: :serial, force: :cascade do |t|
    t.integer "priority", default: 0, null: false
    t.integer "attempts", default: 0, null: false
    t.text "handler", null: false
    t.text "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by"
    t.string "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority"
  end

  create_table "device_configs", force: :cascade do |t|
    t.bigint "device_id"
    t.string "key", limit: 100
    t.string "value", limit: 300
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_device_configs_on_device_id"
  end

  create_table "devices", id: :serial, force: :cascade do |t|
    t.string "name"
    t.integer "max_log_count", default: 100
    t.integer "max_images_count", default: 100
    t.string "timezone", limit: 280
    t.datetime "last_saw_api"
    t.datetime "last_saw_mq"
    t.string "fbos_version", limit: 15
    t.index ["timezone"], name: "index_devices_on_timezone"
  end

  create_table "edge_nodes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "sequence_id", null: false
    t.bigint "primary_node_id", null: false
    t.string "kind", limit: 50
    t.string "value", limit: 300
    t.index ["primary_node_id"], name: "index_edge_nodes_on_primary_node_id"
    t.index ["sequence_id"], name: "index_edge_nodes_on_sequence_id"
  end

  create_table "farm_events", id: :serial, force: :cascade do |t|
    t.integer "device_id"
    t.datetime "start_time"
    t.datetime "end_time"
    t.integer "repeat"
    t.string "time_unit"
    t.string "executable_type", limit: 280
    t.integer "executable_id"
    t.index ["device_id"], name: "index_farm_events_on_device_id"
    t.index ["executable_type", "executable_id"], name: "index_farm_events_on_executable_type_and_executable_id"
  end

  create_table "farmware_installations", force: :cascade do |t|
    t.bigint "device_id"
    t.string "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_farmware_installations_on_device_id"
  end

  create_table "fbos_configs", force: :cascade do |t|
    t.bigint "device_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "auto_sync", default: false
    t.boolean "beta_opt_in", default: false
    t.boolean "disable_factory_reset", default: false
    t.boolean "firmware_input_log", default: false
    t.boolean "firmware_output_log", default: false
    t.boolean "sequence_body_log", default: false
    t.boolean "sequence_complete_log", default: false
    t.boolean "sequence_init_log", default: false
    t.integer "network_not_found_timer"
    t.string "firmware_hardware", default: "arduino"
    t.boolean "api_migrated", default: false
    t.boolean "os_auto_update", default: false
    t.boolean "arduino_debug_messages", default: false
    t.index ["device_id"], name: "index_fbos_configs_on_device_id"
  end

  create_table "firmware_configs", force: :cascade do |t|
    t.bigint "device_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "encoder_enabled_x", default: 0
    t.integer "encoder_enabled_y", default: 0
    t.integer "encoder_enabled_z", default: 0
    t.integer "encoder_invert_x", default: 0
    t.integer "encoder_invert_y", default: 0
    t.integer "encoder_invert_z", default: 0
    t.integer "encoder_missed_steps_decay_x", default: 5
    t.integer "encoder_missed_steps_decay_y", default: 5
    t.integer "encoder_missed_steps_decay_z", default: 5
    t.integer "encoder_missed_steps_max_x", default: 5
    t.integer "encoder_missed_steps_max_y", default: 5
    t.integer "encoder_missed_steps_max_z", default: 5
    t.integer "encoder_scaling_x", default: 56
    t.integer "encoder_scaling_y", default: 56
    t.integer "encoder_scaling_z", default: 56
    t.integer "encoder_type_x", default: 0
    t.integer "encoder_type_y", default: 0
    t.integer "encoder_type_z", default: 0
    t.integer "encoder_use_for_pos_x", default: 0
    t.integer "encoder_use_for_pos_y", default: 0
    t.integer "encoder_use_for_pos_z", default: 0
    t.integer "movement_axis_nr_steps_x", default: 0
    t.integer "movement_axis_nr_steps_y", default: 0
    t.integer "movement_axis_nr_steps_z", default: 0
    t.integer "movement_enable_endpoints_x", default: 0
    t.integer "movement_enable_endpoints_y", default: 0
    t.integer "movement_enable_endpoints_z", default: 0
    t.integer "movement_home_at_boot_x", default: 0
    t.integer "movement_home_at_boot_y", default: 0
    t.integer "movement_home_at_boot_z", default: 0
    t.integer "movement_home_spd_x", default: 50
    t.integer "movement_home_spd_y", default: 50
    t.integer "movement_home_spd_z", default: 50
    t.integer "movement_home_up_x", default: 0
    t.integer "movement_home_up_y", default: 0
    t.integer "movement_home_up_z", default: 1
    t.integer "movement_invert_endpoints_x", default: 0
    t.integer "movement_invert_endpoints_y", default: 0
    t.integer "movement_invert_endpoints_z", default: 0
    t.integer "movement_invert_motor_x", default: 0
    t.integer "movement_invert_motor_y", default: 0
    t.integer "movement_invert_motor_z", default: 0
    t.integer "movement_keep_active_x", default: 0
    t.integer "movement_keep_active_y", default: 0
    t.integer "movement_keep_active_z", default: 1
    t.integer "movement_max_spd_x", default: 400
    t.integer "movement_max_spd_y", default: 400
    t.integer "movement_max_spd_z", default: 400
    t.integer "movement_min_spd_x", default: 50
    t.integer "movement_min_spd_y", default: 50
    t.integer "movement_min_spd_z", default: 50
    t.integer "movement_secondary_motor_invert_x", default: 1
    t.integer "movement_secondary_motor_x", default: 1
    t.integer "movement_step_per_mm_x", default: 5
    t.integer "movement_step_per_mm_y", default: 5
    t.integer "movement_step_per_mm_z", default: 25
    t.integer "movement_steps_acc_dec_x", default: 300
    t.integer "movement_steps_acc_dec_y", default: 300
    t.integer "movement_steps_acc_dec_z", default: 300
    t.integer "movement_stop_at_home_x", default: 0
    t.integer "movement_stop_at_home_y", default: 0
    t.integer "movement_stop_at_home_z", default: 0
    t.integer "movement_stop_at_max_x", default: 0
    t.integer "movement_stop_at_max_y", default: 0
    t.integer "movement_stop_at_max_z", default: 0
    t.integer "movement_timeout_x", default: 120
    t.integer "movement_timeout_y", default: 120
    t.integer "movement_timeout_z", default: 120
    t.integer "param_config_ok", default: 0
    t.integer "param_e_stop_on_mov_err", default: 0
    t.integer "param_mov_nr_retry", default: 3
    t.integer "param_test", default: 0
    t.integer "param_use_eeprom", default: 1
    t.integer "param_version", default: 1
    t.integer "pin_guard_1_active_state", default: 1
    t.integer "pin_guard_1_pin_nr", default: 0
    t.integer "pin_guard_1_time_out", default: 60
    t.integer "pin_guard_2_active_state", default: 1
    t.integer "pin_guard_2_pin_nr", default: 0
    t.integer "pin_guard_2_time_out", default: 60
    t.integer "pin_guard_3_active_state", default: 1
    t.integer "pin_guard_3_pin_nr", default: 0
    t.integer "pin_guard_3_time_out", default: 60
    t.integer "pin_guard_4_active_state", default: 1
    t.integer "pin_guard_4_pin_nr", default: 0
    t.integer "pin_guard_4_time_out", default: 60
    t.integer "pin_guard_5_active_state", default: 1
    t.integer "pin_guard_5_pin_nr", default: 0
    t.integer "pin_guard_5_time_out", default: 60
    t.boolean "api_migrated", default: false
    t.index ["device_id"], name: "index_firmware_configs_on_device_id"
  end

  create_table "generic_pointers", id: :serial, force: :cascade do |t|
  end

  create_table "images", id: :serial, force: :cascade do |t|
    t.integer "device_id"
    t.text "meta"
    t.datetime "attachment_processed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "attachment_file_name"
    t.string "attachment_content_type"
    t.integer "attachment_file_size"
    t.datetime "attachment_updated_at"
    t.index ["device_id"], name: "index_images_on_device_id"
  end

  create_table "log_dispatches", force: :cascade do |t|
    t.bigint "device_id"
    t.bigint "log_id"
    t.datetime "sent_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_log_dispatches_on_device_id"
    t.index ["log_id"], name: "index_log_dispatches_on_log_id"
    t.index ["sent_at"], name: "index_log_dispatches_on_sent_at"
  end

  create_table "logs", id: :serial, force: :cascade do |t|
    t.text "message"
    t.text "meta"
    t.string "channels", limit: 280
    t.integer "device_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_logs_on_device_id"
  end

  create_table "peripherals", id: :serial, force: :cascade do |t|
    t.integer "device_id"
    t.integer "pin"
    t.string "label", limit: 280
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "mode", default: 0
    t.index ["device_id"], name: "index_peripherals_on_device_id"
  end

  create_table "pin_bindings", force: :cascade do |t|
    t.bigint "device_id"
    t.integer "pin_num"
    t.bigint "sequence_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_pin_bindings_on_device_id"
    t.index ["sequence_id"], name: "index_pin_bindings_on_sequence_id"
  end

  create_table "plants", id: :serial, force: :cascade do |t|
    t.string "openfarm_slug", limit: 280, default: "50", null: false
    t.datetime "created_at"
    t.datetime "planted_at"
    t.string "plant_stage", limit: 10, default: "planned"
    t.index ["created_at"], name: "index_plants_on_created_at"
  end

  create_table "points", id: :serial, force: :cascade do |t|
    t.float "radius", default: 25.0, null: false
    t.float "x", null: false
    t.float "y", null: false
    t.float "z", default: 0.0, null: false
    t.integer "device_id", null: false
    t.hstore "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", default: "untitled", null: false
    t.string "pointer_type", limit: 280, null: false
    t.integer "pointer_id", null: false
    t.index ["device_id"], name: "index_points_on_device_id"
    t.index ["meta"], name: "index_points_on_meta", using: :gin
    t.index ["pointer_type", "pointer_id"], name: "index_points_on_pointer_type_and_pointer_id"
  end

  create_table "primary_nodes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "sequence_id", null: false
    t.string "kind", limit: 50
    t.bigint "child_id"
    t.bigint "parent_id"
    t.string "parent_arg_name", limit: 50
    t.bigint "next_id"
    t.bigint "body_id"
    t.string "comment", limit: 80
    t.index ["body_id"], name: "index_primary_nodes_on_body_id"
    t.index ["child_id"], name: "index_primary_nodes_on_child_id"
    t.index ["next_id"], name: "index_primary_nodes_on_next_id"
    t.index ["parent_id"], name: "index_primary_nodes_on_parent_id"
    t.index ["sequence_id"], name: "index_primary_nodes_on_sequence_id"
  end

  create_table "regimen_items", id: :serial, force: :cascade do |t|
    t.bigint "time_offset"
    t.integer "regimen_id"
    t.integer "sequence_id"
    t.index ["regimen_id"], name: "index_regimen_items_on_regimen_id"
    t.index ["sequence_id"], name: "index_regimen_items_on_sequence_id"
  end

  create_table "regimens", id: :serial, force: :cascade do |t|
    t.string "color"
    t.string "name", limit: 280
    t.integer "device_id"
    t.index ["device_id"], name: "index_regimens_on_device_id"
  end

  create_table "sensor_readings", force: :cascade do |t|
    t.bigint "device_id"
    t.float "x"
    t.float "y"
    t.float "z"
    t.integer "value"
    t.integer "pin"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "mode", default: 0
    t.index ["device_id"], name: "index_sensor_readings_on_device_id"
  end

  create_table "sensors", force: :cascade do |t|
    t.bigint "device_id"
    t.integer "pin"
    t.string "label"
    t.integer "mode"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_sensors_on_device_id"
  end

  create_table "sequence_dependencies", id: :serial, force: :cascade do |t|
    t.string "dependency_type"
    t.integer "dependency_id"
    t.integer "sequence_id", null: false
    t.index ["dependency_id"], name: "index_sequence_dependencies_on_dependency_id"
    t.index ["dependency_type"], name: "index_sequence_dependencies_on_dependency_type"
    t.index ["sequence_id"], name: "index_sequence_dependencies_on_sequence_id"
  end

  create_table "sequences", id: :serial, force: :cascade do |t|
    t.integer "device_id"
    t.string "name", null: false
    t.string "color"
    t.string "kind", limit: 280, default: "sequence"
    t.text "args"
    t.text "body"
    t.datetime "updated_at"
    t.datetime "created_at"
    t.boolean "migrated_nodes", default: false
    t.index ["created_at"], name: "index_sequences_on_created_at"
    t.index ["device_id"], name: "index_sequences_on_device_id"
  end

  create_table "token_expirations", id: :serial, force: :cascade do |t|
    t.string "sub"
    t.integer "exp"
    t.string "jti"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tool_slots", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "tool_id"
    t.integer "pullout_direction", default: 0
    t.index ["tool_id"], name: "index_tool_slots_on_tool_id"
  end

  create_table "tools", id: :serial, force: :cascade do |t|
    t.string "name", limit: 280
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "device_id"
    t.index ["device_id"], name: "index_tools_on_device_id"
  end

  create_table "users", id: :serial, force: :cascade do |t|
    t.integer "device_id"
    t.string "name"
    t.string "email", limit: 280, default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "confirmed_at"
    t.string "confirmation_token"
    t.datetime "agreed_to_terms_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.index ["agreed_to_terms_at"], name: "index_users_on_agreed_to_terms_at"
    t.index ["device_id"], name: "index_users_on_device_id"
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "web_app_configs", force: :cascade do |t|
    t.bigint "device_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "confirm_step_deletion", default: false
    t.boolean "disable_animations", default: false
    t.boolean "disable_i18n", default: false
    t.boolean "display_trail", default: false
    t.boolean "dynamic_map", default: false
    t.boolean "encoder_figure", default: false
    t.boolean "hide_webcam_widget", default: false
    t.boolean "legend_menu_open", default: false
    t.boolean "map_xl", default: false
    t.boolean "raw_encoders", default: false
    t.boolean "scaled_encoders", default: false
    t.boolean "show_spread", default: false
    t.boolean "show_farmbot", default: true
    t.boolean "show_plants", default: true
    t.boolean "show_points", default: true
    t.boolean "x_axis_inverted", default: false
    t.boolean "y_axis_inverted", default: false
    t.boolean "z_axis_inverted", default: false
    t.integer "bot_origin_quadrant", default: 2
    t.integer "zoom_level", default: 1
    t.integer "success_log", default: 1
    t.integer "busy_log", default: 1
    t.integer "warn_log", default: 1
    t.integer "error_log", default: 1
    t.integer "info_log", default: 1
    t.integer "fun_log", default: 1
    t.integer "debug_log", default: 1
    t.boolean "stub_config", default: false
    t.boolean "show_first_party_farmware", default: false
    t.boolean "enable_browser_speak", default: false
    t.boolean "show_images", default: false
    t.string "photo_filter_begin"
    t.string "photo_filter_end"
    t.boolean "discard_unsaved", default: false
    t.index ["device_id"], name: "index_web_app_configs_on_device_id"
  end

  create_table "webcam_feeds", force: :cascade do |t|
    t.bigint "device_id"
    t.string "url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name", limit: 80, default: "Webcam Feed"
    t.index ["device_id"], name: "index_webcam_feeds_on_device_id"
  end

  add_foreign_key "device_configs", "devices"
  add_foreign_key "edge_nodes", "sequences"
  add_foreign_key "farmware_installations", "devices"
  add_foreign_key "log_dispatches", "devices"
  add_foreign_key "log_dispatches", "logs"
  add_foreign_key "peripherals", "devices"
  add_foreign_key "pin_bindings", "devices"
  add_foreign_key "pin_bindings", "sequences"
  add_foreign_key "points", "devices"
  add_foreign_key "primary_nodes", "sequences"
  add_foreign_key "sensor_readings", "devices"
  add_foreign_key "sensors", "devices"
  add_foreign_key "sequence_dependencies", "sequences"
  add_foreign_key "tool_slots", "tools"
end
