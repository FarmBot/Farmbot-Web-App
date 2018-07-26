class AddThrottledAtToDevice < ActiveRecord::Migration[5.2]
  safety_assured
  def change
    add_column :devices, :throttled_at, :datetime
  end
end
