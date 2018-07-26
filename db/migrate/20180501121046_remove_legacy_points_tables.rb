class RemoveLegacyPointsTables < ActiveRecord::Migration[5.1]
  BIG_WARNING = \
  "It appears that your database contains records which still require "\
  "migration. Please migrate data before proceeding."
  safety_assured
  def safe_to_proceed?
    any_plants = \
      Plant.where(migrated_at: nil).where.not(pointer_id: 0).count > 0
    any_tool_slots = \
      ToolSlot.where(migrated_at: nil).where.not(pointer_id: 0).count > 0
    raise BIG_WARNING if (any_plants || any_tool_slots)
  end

  def up
    safe_to_proceed?

    drop_table "legacy_generic_pointers" do |t|
      nil
    end

    drop_table "legacy_plants" do |t|
      t.string "openfarm_slug", limit: 280, default: "50", null: false
      t.datetime "created_at"
      t.datetime "planted_at"
      t.string "plant_stage", limit: 10, default: "planned"
      t.index ["created_at"], name: "index_legacy_plants_on_created_at"
    end

    drop_table "legacy_tool_slots" do |t|
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.integer "tool_id"
      t.integer "pullout_direction", default: 0
      t.index ["tool_id"], name: "index_legacy_tool_slots_on_tool_id"
    end

    remove_column :points, :pointer_id, :integer
  end

  def down
    create_table "legacy_generic_pointers" do |t|
      nil
    end

    create_table "legacy_plants" do |t|
      t.string "openfarm_slug", limit: 280, default: "50", null: false
      t.datetime "created_at"
      t.datetime "planted_at"
      t.string "plant_stage", limit: 10, default: "planned"
      t.index ["created_at"], name: "index_legacy_plants_on_created_at"
    end

    create_table "legacy_tool_slots" do |t|
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.integer "tool_id"
      t.integer "pullout_direction", default: 0
      t.index ["tool_id"], name: "index_legacy_tool_slots_on_tool_id"
    end

    add_column :points, :pointer_id, :integer
  end
end
