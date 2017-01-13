class AddMissingDatabaseIndexes < ActiveRecord::Migration[5.0]
  def change
    add_index :planting_areas, :device_id
    add_index :regimen_items,  :regimen_id
    add_index :regimen_items,  :sequence_id
    add_index :schedules,      :sequence_id
    add_index :schedules,      :device_id
    add_index :sequences,      :device_id
    add_index :regimens,       :device_id
    add_index :devices,        :planting_area_id
    add_index :plants,         :planting_area_id
    add_index :plants,         :device_id
    add_index :users,          :device_id
  end
end
