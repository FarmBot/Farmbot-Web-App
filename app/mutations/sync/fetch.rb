module Sync
  class Fetch  < Mutations::Command
    required do
      model :device, class: Device
    end

    def execute
      message = {
          device: device,
          users: device.users,
          sequences: device.sequences,
          regimens: device.regimens,
          regimen_items: device.regimen_items,
          plants: device.plants
      }.as_json
      message[:checksum] = Digest::MD5.hexdigest(Marshal::dump(message))
      message
    end
  end
end
