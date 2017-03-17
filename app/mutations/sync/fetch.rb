module Sync
  class Fetch  < Mutations::Command
    API_VERSION = ENV.fetch("HEROKU_SLUG_COMMIT",
                            `git log --pretty=format:"%h" -1`)

    required do
      model :device, class: Device
    end

    def execute
      return {
        users:         device.users,
        regimen_items: RegimenItem.where(regimen_id: device.regimens.pluck(:id))
      }
    end
  end
end
