# encoding: UTF-8
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
    t.integer "planting_area_id", limit: 4
    t.string  "name",             limit: 255
    t.string  "webcam_url",       limit: 255
  end

  create_table "peripherals", force: :cascade do |t|
    t.integer  "device_id",  limit: 4
    t.integer  "pin",        limit: 4
    t.integer  "mode",       limit: 4
    t.string   "label",      limit: 255
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  add_index "peripherals", ["device_id"], name: "index_peripherals_on_device_id", using: :btree

  create_table "planting_areas", force: :cascade do |t|
    t.integer "width",     limit: 4
    t.integer "length",    limit: 4
    t.integer "device_id", limit: 4
  end

  create_table "plants", force: :cascade do |t|
    t.integer  "device_id",        limit: 4
    t.integer  "planting_area_id", limit: 4
    t.string   "name",             limit: 255
    t.string   "img_url",          limit: 255
    t.string   "icon_url",         limit: 255
    t.string   "openfarm_slug",    limit: 255
    t.float    "x",                limit: 24,  default: 0.0
    t.float    "y",                limit: 24,  default: 0.0
    t.datetime "planted_at"
  end

  create_table "regimen_items", force: :cascade do |t|
    t.integer "time_offset", limit: 8
    t.integer "regimen_id",  limit: 4
    t.integer "sequence_id", limit: 4
  end

  create_table "regimens", force: :cascade do |t|
    t.string  "color",     limit: 255
    t.string  "name",      limit: 255
    t.integer "device_id", limit: 4
  end

  create_table "schedules", force: :cascade do |t|
    t.integer  "sequence_id", limit: 4
    t.integer  "device_id",   limit: 4
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "next_time"
    t.integer  "repeat",      limit: 4
    t.string   "time_unit",   limit: 255
  end

  create_table "sequence_dependencies", force: :cascade do |t|
    t.integer "dependency_id",   limit: 4
    t.string  "dependency_type", limit: 255
    t.integer "sequence_id",     limit: 4
  end

  add_index "sequence_dependencies", ["dependency_id"], name: "index_sequence_dependencies_on_dependency_id", using: :btree
  add_index "sequence_dependencies", ["dependency_type"], name: "index_sequence_dependencies_on_dependency_type", using: :btree
  add_index "sequence_dependencies", ["sequence_id"], name: "index_sequence_dependencies_on_sequence_id", using: :btree

  create_table "sequences", force: :cascade do |t|
    t.integer "device_id", limit: 4
    t.string  "name",      limit: 255
    t.string  "color",     limit: 255
    t.string  "kind",      limit: 255,   default: "sequence"
    t.text    "args",      limit: 65535
    t.text    "body",      limit: 65535
  end

  create_table "users", force: :cascade do |t|
    t.integer  "device_id",              limit: 4
    t.string   "name",                   limit: 255
    t.string   "email",                  limit: 255, default: "", null: false
    t.string   "encrypted_password",     limit: 255, default: "", null: false
    t.string   "reset_password_token",   limit: 255
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          limit: 4,   default: 0,  null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip",     limit: 255
    t.string   "last_sign_in_ip",        limit: 255
    t.datetime "created_at",                                      null: false
    t.datetime "updated_at",                                      null: false
  end

  add_index "users", ["email"], name: "index_users_on_email", unique: true, using: :btree
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true, using: :btree

  add_foreign_key "peripherals", "devices"
end
