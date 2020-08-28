module Devices
  class UnattendedUpgrade < Mutations::Command
    def validate
      eligible_devices.map { |dev| begin_upgrade(dev) }
    end

    def execute
    end

    private

    def eligible_devices
      Release::CHANNEL
        .map do |chan| [chan, latest_version(chan)] end
        .select { |_chan, version| version.present? }
        .map do |(chan, version)| end
    end

    def latest_version(chan)
      Release.latest_for({ channel: chan }).version
    end

    def relevant_devices(chan, version)
      Device
        .includes(:fbos_config)
        .where(chan: chan)
        .where.not(version: version)
        .where("fbos_configs.os_auto_update" => true)
    end
  end
end
