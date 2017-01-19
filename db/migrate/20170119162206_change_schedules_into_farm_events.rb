class ChangeSchedulesIntoFarmEvents < ActiveRecord::Migration[5.0]
  def change
    remove_column :schedules, :sequence_id, :integer
    rename_table  :schedules, :farm_events
    add_column    :farm_events, :repeats, :boolean
    add_reference :farm_events,
                  :executable,
                  polymorphic: true,
                  index:       true
  end
end
