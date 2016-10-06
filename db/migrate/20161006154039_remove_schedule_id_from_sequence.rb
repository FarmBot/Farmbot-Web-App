class RemoveScheduleIdFromSequence < ActiveRecord::Migration
  def change
    remove_column :sequences, :schedule_id, :integer
  end
end
