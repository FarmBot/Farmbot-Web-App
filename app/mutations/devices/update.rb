module Devices
  class Update < Mutations::Command
    required do
      model :device, class: Device
    end

    optional do
      string  :name
      string  :webcam_url, empty: true
    end

    def execute
      device.update_attributes!(inputs.except(:device))
      device
    end
  end
end
