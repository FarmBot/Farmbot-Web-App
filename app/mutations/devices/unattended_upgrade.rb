module Devices
  class UnattendedUpgrade < Mutations::Command
    def validate
      eligible_devices.map { |dev| begin_upgrade(dev) }
    end

    def execute
    end

    private

    def eligible_devices
    end
  end
end
