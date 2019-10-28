class DeprecateDeviceSerialNumberTable < ActiveRecord::Migration[5.2]

  unless Kernel.const_defined?("DeviceSerialNumber")
    # Shim so that legacy users don't crash when (up|down)grading
    class DeviceSerialNumber
      def self.preload(*x)
      end
    end
  end

  def change
    DeviceSerialNumber.preload(:devices) do |x|
      x.device.update!(serial_number: x.serial_number)
    end
  end
end
