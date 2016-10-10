class RemoveScheduleIdFromRegimenItems < ActiveRecord::Migration
  def change
    remove_column :regimen_items, :schedule_id, :integer
  end
end
