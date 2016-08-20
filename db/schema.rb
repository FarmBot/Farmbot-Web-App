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

ActiveRecord::Schema.define(version: 20160820050202) do

  create_table "commands", force: :cascade do |t|
    t.string "step_id"
  end

  create_table "devices", force: :cascade do |t|
    t.string "planting_area_id"
    t.string "uuid"
    t.string "token"
    t.string "name"
  end

  create_table "planting_areas", force: :cascade do |t|
    t.string "width"
    t.string "length"
    t.string "device_id"
  end

  create_table "plants", force: :cascade do |t|
    t.string "device_id"
    t.string "planting_area_id"
    t.string "name"
    t.string "img_url"
    t.string "icon_url"
    t.string "openfarm_slug"
    t.string "x"
    t.string "y"
    t.string "planted_at"
  end

  create_table "regimen_items", force: :cascade do |t|
    t.string "time_offset"
    t.string "schedule_id"
    t.string "regimen_id"
    t.string "sequence_id"
  end

  create_table "regimens", force: :cascade do |t|
    t.string "color"
    t.string "name"
    t.string "device_id"
  end

  create_table "schedules", force: :cascade do |t|
    t.string "sequence_id"
    t.string "device_id"
    t.string "start_time"
    t.string "end_time"
    t.string "next_time"
    t.string "repeat"
    t.string "time_unit"
  end

  create_table "sequences", force: :cascade do |t|
    t.string "schedule_id"
    t.string "device_id"
    t.string "regimen"
    t.string "name"
    t.string "color"
  end

  create_table "steps", force: :cascade do |t|
    t.string "sequence_id"
    t.string "message_type"
    t.string "position"
  end

  create_table "users", force: :cascade do |t|
    t.string "device_id"
    t.string "name"
    t.string "email"
    t.string "encrypted_password"
    t.string "reset_password_token"
    t.string "reset_password_sent_at"
    t.string "remember_created_at"
    t.string "sign_in_count"
    t.string "current_sign_in_at"
    t.string "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
  end

end
