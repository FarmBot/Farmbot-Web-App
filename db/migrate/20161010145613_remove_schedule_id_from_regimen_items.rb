class RemoveScheduleIdFromRegimenItems < ActiveRecord::Migration[4.2]
  def change
    remove_column :regimen_items, :schedule_id, :integer
  end
end
