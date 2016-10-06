module Sync
  class Fetch  < Mutations::Command
    required do
      model :device, class: Device
    end

    def execute
      regimens = device.regimens;
      message = {
          device: device,
          users: device.users,
          sequences: device.sequences,
          regimens: regimens,
          regimen_items: RegimenItem.where(regimen_id: regimens.pluck(:id)),
          plants: device.plants
      }.as_json
      message[:checksum] = Digest::MD5.hexdigest(Marshal::dump(message))
      message
    end
  end
end
