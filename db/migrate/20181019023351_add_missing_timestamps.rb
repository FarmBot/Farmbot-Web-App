class AddMissingTimestamps < ActiveRecord::Migration[5.2]
  def change
    add_timestamps(:devices,         null: true)
    add_timestamps(:farm_events,     null: true)
    add_timestamps(:plant_templates, null: true)
    add_timestamps(:regimen_items,   null: true)
    add_timestamps(:regimens,        null: true)
  end
end
