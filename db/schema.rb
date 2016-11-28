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

ActiveRecord::Schema.define(version: 20161028175744) do

  create_table "devices", force: :cascade do |t|
    t.integer "planting_area_id"
    t.string  "name"
    t.string  "webcam_url"
  end

  create_table "peripherals", force: :cascade do |t|
    t.integer  "device_id"
    t.integer  "pin"
    t.integer  "mode"
    t.string   "label"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_peripherals_on_device_id"
  end

  create_table "planting_areas", force: :cascade do |t|
    t.integer "width"
    t.integer "length"
    t.integer "device_id"
  end

  create_table "plants", force: :cascade do |t|
    t.integer  "device_id"
    t.integer  "planting_area_id"
    t.string   "name"
    t.string   "img_url"
    t.string   "icon_url"
    t.string   "openfarm_slug"
    t.float    "x",                default: 0.0
    t.float    "y",                default: 0.0
    t.datetime "planted_at"
  end

  create_table "regimen_items", force: :cascade do |t|
    t.integer "time_offset", limit: 8
    t.integer "regimen_id"
    t.integer "sequence_id"
  end

  create_table "regimens", force: :cascade do |t|
    t.string  "color"
    t.string  "name"
    t.integer "device_id"
  end

  create_table "schedules", force: :cascade do |t|
    t.integer  "sequence_id"
    t.integer  "device_id"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "next_time"
    t.integer  "repeat"
    t.string   "time_unit"
  end

  create_table "sequence_dependencies", force: :cascade do |t|
    t.string  "dependency_type"
    t.integer "dependency_id"
    t.integer "sequence_id"
    t.index ["dependency_id"], name: "index_sequence_dependencies_on_dependency_id"
    t.index ["dependency_type"], name: "index_sequence_dependencies_on_dependency_type"
    t.index ["sequence_id"], name: "index_sequence_dependencies_on_sequence_id"
  end

  create_table "sequences", force: :cascade do |t|
    t.integer "device_id"
    t.string  "name"
    t.string  "color"
    t.string  "kind",      default: "sequence"
    t.text    "args"
    t.text    "body"
  end

  create_table "users", force: :cascade do |t|
    t.integer  "device_id"
    t.string   "name"
    t.string   "email",                  default: "", null: false
    t.string   "encrypted_password",     default: "", null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

end
