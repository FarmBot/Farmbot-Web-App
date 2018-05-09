class RemoveArchivedAtColFromPoints < ActiveRecord::Migration[5.1]
  def change
    # We use `discarded_at` now, because that what the "discard" gem wants.
    remove_column :points, :archived_at, :datetime, default: nil
  end
end
