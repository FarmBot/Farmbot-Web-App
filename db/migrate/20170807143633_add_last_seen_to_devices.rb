class AddLastSeenToDevices < ActiveRecord::Migration[5.1]

  def change
    add_column :devices, :last_seen, :datetime
  end
end
