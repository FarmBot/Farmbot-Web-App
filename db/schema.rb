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

ActiveRecord::Schema.define(version: 20170207132639) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"
  enable_extension "hstore"

  create_table "delayed_jobs", force: :cascade do |t|
    t.integer  "priority",   default: 0, null: false
    t.integer  "attempts",   default: 0, null: false
    t.text     "handler",                null: false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.index ["priority", "run_at"], name: "delayed_jobs_priority", using: :btree
  end

  create_table "devices", force: :cascade do |t|
    t.integer "planting_area_id"
    t.string  "name"
    t.string  "webcam_url"
    t.integer "max_log_count",    default: 100
    t.integer "max_images_count", default: 100
    t.index ["planting_area_id"], name: "index_devices_on_planting_area_id", using: :btree
  end

  create_table "farm_events", force: :cascade do |t|
    t.integer  "device_id"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "next_time"
    t.integer  "repeat"
    t.string   "time_unit"
    t.boolean  "repeats"
    t.string   "executable_type"
    t.integer  "executable_id"
    t.index ["device_id"], name: "index_farm_events_on_device_id", using: :btree
    t.index ["executable_type", "executable_id"], name: "index_farm_events_on_executable_type_and_executable_id", using: :btree
  end

  create_table "images", force: :cascade do |t|
    t.integer  "device_id"
    t.text     "meta"
    t.datetime "attachment_processed_at"
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.string   "attachment_file_name"
    t.string   "attachment_content_type"
    t.integer  "attachment_file_size"
    t.datetime "attachment_updated_at"
    t.index ["device_id"], name: "index_images_on_device_id", using: :btree
  end

  create_table "logs", force: :cascade do |t|
    t.text     "message"
    t.text     "meta"
    t.text     "channels"
    t.integer  "device_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_logs_on_device_id", using: :btree
  end

  create_table "peripherals", force: :cascade do |t|
    t.integer  "device_id"
    t.integer  "pin"
    t.integer  "mode"
    t.string   "label"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_peripherals_on_device_id", using: :btree
  end

  create_table "planting_areas", force: :cascade do |t|
    t.integer "width"
    t.integer "length"
    t.integer "device_id"
    t.index ["device_id"], name: "index_planting_areas_on_device_id", using: :btree
  end

  create_table "plants", force: :cascade do |t|
    t.integer  "device_id"
    t.integer  "planting_area_id"
    t.string   "name"
    t.string   "img_url"
    t.string   "icon_url"
    t.string   "openfarm_slug"
    t.integer  "x",                default: 0
    t.integer  "y",                default: 0
    t.datetime "created_at"
    t.index ["created_at"], name: "index_plants_on_created_at", using: :btree
    t.index ["device_id"], name: "index_plants_on_device_id", using: :btree
    t.index ["planting_area_id"], name: "index_plants_on_planting_area_id", using: :btree
  end

  create_table "points", force: :cascade do |t|
    t.float    "radius"
    t.float    "x"
    t.float    "y"
    t.float    "z"
    t.integer  "device_id"
    t.hstore   "meta"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_points_on_device_id", using: :btree
    t.index ["meta"], name: "index_points_on_meta", using: :gin
  end

  create_table "regimen_items", force: :cascade do |t|
    t.bigint  "time_offset"
    t.integer "regimen_id"
    t.integer "sequence_id"
    t.index ["regimen_id"], name: "index_regimen_items_on_regimen_id", using: :btree
    t.index ["sequence_id"], name: "index_regimen_items_on_sequence_id", using: :btree
  end

  create_table "regimens", force: :cascade do |t|
    t.string  "color"
    t.string  "name"
    t.integer "device_id"
    t.index ["device_id"], name: "index_regimens_on_device_id", using: :btree
  end

  create_table "sequence_dependencies", force: :cascade do |t|
    t.string  "dependency_type"
    t.integer "dependency_id"
    t.integer "sequence_id"
    t.index ["dependency_id"], name: "index_sequence_dependencies_on_dependency_id", using: :btree
    t.index ["dependency_type"], name: "index_sequence_dependencies_on_dependency_type", using: :btree
    t.index ["sequence_id"], name: "index_sequence_dependencies_on_sequence_id", using: :btree
  end

  create_table "sequences", force: :cascade do |t|
    t.integer  "device_id"
    t.string   "name"
    t.string   "color"
    t.string   "kind",       default: "sequence"
    t.text     "args"
    t.text     "body"
    t.datetime "updated_at"
    t.datetime "created_at"
    t.index ["created_at"], name: "index_sequences_on_created_at", using: :btree
    t.index ["device_id"], name: "index_sequences_on_device_id", using: :btree
  end

  create_table "token_expirations", force: :cascade do |t|
    t.string   "sub"
    t.integer  "exp"
    t.string   "jti"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "tool_bays", force: :cascade do |t|
    t.integer  "device_id"
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_tool_bays_on_device_id", using: :btree
  end

  create_table "tool_slots", force: :cascade do |t|
    t.integer  "tool_bay_id"
    t.string   "name"
    t.integer  "x"
    t.integer  "y"
    t.integer  "z"
    t.datetime "created_at",  null: false
    t.datetime "updated_at",  null: false
    t.integer  "tool_id"
    t.index ["tool_bay_id"], name: "index_tool_slots_on_tool_bay_id", using: :btree
    t.index ["tool_id"], name: "index_tool_slots_on_tool_id", using: :btree
  end

  create_table "tools", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer  "device_id"
    t.index ["device_id"], name: "index_tools_on_device_id", using: :btree
  end

  create_table "users", force: :cascade do |t|
    t.integer  "device_id"
    t.string   "name"
    t.string   "email",              default: "", null: false
    t.string   "encrypted_password", default: "", null: false
    t.integer  "sign_in_count",      default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                      null: false
    t.datetime "updated_at",                      null: false
    t.datetime "verified_at"
    t.string   "verification_token"
    t.datetime "agreed_to_terms_at"
    t.index ["agreed_to_terms_at"], name: "index_users_on_agreed_to_terms_at", using: :btree
    t.index ["device_id"], name: "index_users_on_device_id", using: :btree
    t.index ["email"], name: "index_users_on_email", unique: true, using: :btree
  end

  add_foreign_key "points", "devices"
end
