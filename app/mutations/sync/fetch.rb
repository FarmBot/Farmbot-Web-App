module Sync
  class Fetch  < Mutations::Command
    COMPAT_NUM = 0

    required do
      model :device, class: Device
    end

    def execute
      regimens = device.regimens;
      message = {
          compat_num: COMPAT_NUM,
          device: device,
          users: device.users,
          sequences: device.sequences,
          regimens: regimens,
          peripherals: device.peripherals,
          regimen_items: RegimenItem.where(regimen_id: regimens.pluck(:id)),
          plants: device.plants
      }.as_json
      message
    end
  end
end