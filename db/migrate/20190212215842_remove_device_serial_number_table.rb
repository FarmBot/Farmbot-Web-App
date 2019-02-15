class RemoveDeviceSerialNumberTable < ActiveRecord::Migration[5.2]
  def change
    drop_table :device_serial_numbers
  end
end
