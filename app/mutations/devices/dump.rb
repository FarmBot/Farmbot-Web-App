module Devices
  class Dump < Mutations::Command
    RESOURCES = {
      farm_events:  FarmEventSerializer,
      images:       ImageSerializer,
      peripherals:  PeripheralSerializer,
      points:       PointSerializer,
      regimens:     RegimenSerializer,
      sequences:    SequenceSerializer,
      tools:        ToolSerializer,
      users:        UserSerializer,
      webcam_feeds: WebcamFeedSerialize
    }

    def self.run_by_id(id)
      Devices::Dump.delay.run(device_id: current_device)
    end

    required { model :device_id, class: number }

    def execute
      output = { device: DeviceSerializer.new(device).as_json }
      RESOURCES.map do |(name, serializer)|
        list = device.send(name)
        output[name] = list.map { |x| serializer.new(x).as_json }
      end
      output
    end

  private

    def device
      @device ||= Device.find(device_id)
    end
end
