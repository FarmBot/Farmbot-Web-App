class ResourceService < Mutations::Command
  RESOURCES = %w{ DeviceConfig DiagnosticDump FarmEvent FarmwareInstallations
                  Image Log Peripheral PinBinding PlantTemplate Point Regimen
                  SavedGarden SensorReading Sensor Sequence Tool WebcamFeed }

  def self.process(delivery_info, payload)
    `espeak "Ding"`
    puts "Got a resource message, but this is a noop atm."
  end
end
