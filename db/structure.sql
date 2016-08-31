CREATE TABLE "schema_migrations" ("version" varchar NOT NULL);
CREATE UNIQUE INDEX "unique_schema_migrations" ON "schema_migrations" ("version");
CREATE TABLE "devices" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "planting_area_id" integer, "uuid" varchar, "token" varchar, "name" varchar);
CREATE TABLE "planting_areas" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "width" integer, "length" integer, "device_id" integer);
CREATE TABLE "plants" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "device_id" integer, "planting_area_id" integer, "name" varchar, "img_url" varchar, "icon_url" varchar, "openfarm_slug" varchar, "x" varchar, "y" varchar, "planted_at" varchar);
CREATE TABLE "regimen_items" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "time_offset" varchar, "schedule_id" integer, "regimen_id" integer, "sequence_id" integer);
CREATE TABLE "regimens" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "color" varchar, "name" varchar, "device_id" integer);
CREATE TABLE "schedules" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "sequence_id" integer, "device_id" integer, "start_time" datetime, "end_time" datetime, "next_time" datetime, "repeat" integer, "time_unit" varchar);
CREATE TABLE "sequences" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "schedule_id" integer, "device_id" integer, "regimen" varchar, "name" varchar, "color" varchar);
CREATE TABLE "steps" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "sequence_id" integer, "message_type" varchar, "position" integer, "command" text);
CREATE TABLE "users" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "device_id" integer, "name" varchar, "email" varchar DEFAULT '' NOT NULL, "encrypted_password" varchar DEFAULT '' NOT NULL, "reset_password_token" varchar, "reset_password_sent_at" datetime, "remember_created_at" datetime, "sign_in_count" integer DEFAULT 0 NOT NULL, "current_sign_in_at" datetime, "last_sign_in_at" datetime, "current_sign_in_ip" varchar, "last_sign_in_ip" varchar, "created_at" datetime NOT NULL, "updated_at" datetime NOT NULL);
CREATE UNIQUE INDEX "index_users_on_email" ON "users" ("email");
CREATE UNIQUE INDEX "index_users_on_reset_password_token" ON "users" ("reset_password_token");
INSERT INTO schema_migrations (version) VALUES ('20160820050202');

