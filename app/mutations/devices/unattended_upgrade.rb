module Devices
  class UnattendedUpgrade < Mutations::Command
    # def validate
    #   eligible_devices.map { |dev| begin_upgrade(dev) }
    # end

    def execute
    end

    def eligible_devices(chan)
      Device
        .includes(:fbos_config)
        .where("fbos_configs.update_channel" => chan)
        .where.not(fbos_version: latest_version(chan))
        .where("fbos_configs.os_auto_update" => true)
    end

    def latest_version(chan)
      Release.maybe_find_latest({ channel: chan }).version
    end
  end
end
