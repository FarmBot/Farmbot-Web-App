module Sync
  class Fetch  < Mutations::Command
    API_VERSION = `git log --pretty=format:"%h" -1`
    COMPAT_NUM = 0

    required do
      model :device, class: Device
    end

    def execute
      regimens = device.regimens;
      message = {
          api_version: API_VERSION,
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