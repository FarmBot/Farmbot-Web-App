module Devices
  class UnattendedUpgrade < Mutations::Command
    # def validate
    #   eligible_devices.map { |dev| begin_upgrade(dev) }
    # end

    def execute
      all_eligible_devices.map do |d|
        puts "TODO: OTA For device_#{d.id}"
      end
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
    end

    def latest_version(chan)
      Release.maybe_find_latest(channel: chan).version
    end
  end
end
