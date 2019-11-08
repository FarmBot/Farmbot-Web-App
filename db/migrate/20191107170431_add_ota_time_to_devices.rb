class AddOtaTimeToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices, :ota_hour, :integer, default: 3
  end
end
