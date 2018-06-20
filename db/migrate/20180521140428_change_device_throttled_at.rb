class ChangeDeviceThrottledAt < ActiveRecord::Migration[5.2]
  def change
    remove_column :devices, :throttled_at,    :datetime
    add_column    :devices, :throttled_until, :datetime
  end
end
