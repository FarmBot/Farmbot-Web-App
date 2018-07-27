class RenameLegacyPointerTables < ActiveRecord::Migration[5.1]
  NAME_MAPPING = {
    "generic_pointers" => "legacy_generic_pointers",
    "tool_slots"       => "legacy_tool_slots",
    "plants"           => "legacy_plants",
  }
  safety_assured

  def self.up
    add_column :points, :migrated_at, :datetime
    NAME_MAPPING.map { |(old_name, new_name)| rename_table old_name, new_name }
  end

  def self.down
    remove_column :points, :migrated_at, :datetime
    NAME_MAPPING.map { |(old_name, new_name)| rename_table new_name, old_name }
  end
end
