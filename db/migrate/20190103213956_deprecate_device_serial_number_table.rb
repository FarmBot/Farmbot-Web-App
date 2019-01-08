class DeprecateDeviceSerialNumberTable < ActiveRecord::Migration[5.2]
  def change
    DeviceSerialNumber.preload(:devices) do |x|
      x.device
       .update_attributes!(serial_number: x.serial_number)
    end
  end
end
