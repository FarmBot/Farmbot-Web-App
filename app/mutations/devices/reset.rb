module Devices
  class Reset < Mutations::Command
    required { model :device }

    def execute
      Device::SINGULAR_RESOURCES.keys.map do |resource|
        device.send(resource).destroy!
      end

      Device::PLURAL_RESOURCES.map do |resources|
        device.send(resources).destroy_all
      end

      { ok: "OK" }
    end
  end
end
