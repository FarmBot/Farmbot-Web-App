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

ActiveRecord::Schema.define(version: 20161006154039) do

  create_table "devices", force: :cascade do |t|
    t.integer "planting_area_id", limit: 4
    t.string  "uuid",             limit: 255
    t.string  "name",             limit: 255
    t.string  "webcam_url",       limit: 255
  end

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
    t.integer "schedule_id", limit: 4
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

  create_table "sequences", force: :cascade do |t|
    t.integer "device_id", limit: 4
    t.string  "name",      limit: 255
    t.string  "color",     limit: 255
  end

  create_table "step_params", force: :cascade do |t|
    t.string  "key",     limit: 255
    t.string  "value",   limit: 255
    t.integer "step_id", limit: 4
  end

  add_index "step_params", ["step_id"], name: "index_step_params_on_step_id", using: :btree

  create_table "steps", force: :cascade do |t|
    t.integer "sequence_id",  limit: 4
    t.string  "message_type", limit: 255
    t.integer "position",     limit: 4
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

  add_foreign_key "step_params", "steps"
end
