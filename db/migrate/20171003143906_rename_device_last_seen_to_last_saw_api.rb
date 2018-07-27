class RenameDeviceLastSeenToLastSawApi < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    rename_column :devices, :last_seen, :last_saw_api
  end
end
