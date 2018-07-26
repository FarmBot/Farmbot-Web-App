class AddLastSeenToDevices < ActiveRecord::Migration[5.1]
  safety_assured
  def change
    add_column :devices, :last_seen, :datetime
  end
end
