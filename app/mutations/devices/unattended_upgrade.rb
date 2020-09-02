module Devices
  class UnattendedUpgrade < Mutations::Command
    # def validate
    #   eligible_devices.map { |dev| begin_upgrade(dev) }
    # end

    def execute
      all_eligible_devices.map(&:send_upgrade_request)
    end

    def all_eligible_devices
      Release::CHANNEL
        .map { |chan| eligible_devices(chan) }
        .reduce(:or)
    end

    def eligible_devices(chan)
      Device
        .includes(:fbos_config)
        .where("fbos_configs.update_channel" => chan)
        .where.not(fbos_version: latest_version(chan))
        .where("fbos_configs.os_auto_update" => true)
        .where(ota_hour_utc: [nil, Time.now.utc.hour])
    end

    def latest_version(chan)
      Release.maybe_find_latest(channel: chan).version
    end
  end
end
