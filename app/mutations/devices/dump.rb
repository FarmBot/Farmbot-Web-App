module Devices
  # DO NOT USE THIS IN YOUR APPLICATION! = = = = = =
  # Download all your account data as a single JSON document. Used by the dev
  # team to debug data related issues (especially those that are specific to a
  # particular server or database).
  # DO NOT USE THIS IN YOUR APPLICATION! = = = = = =
  class Dump < Mutations::Command
    RESOURCES = [
      Pair[:images,       ImageSerializer],
      Pair[:regimens,     RegimenSerializer],
      Pair[:peripherals,  PeripheralSerializer],
      # Pair[:sequences,    SequenceSerializer],
      Pair[:farm_events,  FarmEventSerializer],
      Pair[:tools,        ToolSerializer],
      Pair[:points,       PointSerializer],
      Pair[:users,        UserSerializer],
      Pair[:webcam_feeds, WebcamFeedSerializer]
    ]

    required do
      model :device, class: Device
    end

    def execute
      output = { device: DeviceSerializer.new(device).as_json }
      RESOURCES.map do |pair|
        list = device.send(pair.head)
        output[pair.head] = list.map { |x| pair.tail.new(x).as_json }
      end
      output
    end
  end
end
