class CleanUpOldDatabaseEntries < ActiveRecord::Migration[5.0]
  def change
    remove_column :plants,      :img_url
    remove_column :plants,      :icon_url
    remove_column :plants,      :planting_area_id
    remove_column :devices,     :planting_area_id
    remove_column :devices,     :timezone
    remove_column :farm_events, :next_time
    drop_table    :planting_areas
  end
end
