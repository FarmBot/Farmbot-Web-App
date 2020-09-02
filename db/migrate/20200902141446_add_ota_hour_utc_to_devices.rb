class AddOtaHourUtcToDevices < ActiveRecord::Migration[6.0]
  def change
    add_column :devices, :ota_hour_utc, :integer
  end
end
