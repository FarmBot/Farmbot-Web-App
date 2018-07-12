module Resources
  class Job
    attr_reader :device, :kind, :resource_id, :resource_type, :uuid

    def initialize(device, kind, resource_id, resource_type, uuid)
    end

    def reject
    end

    def resolve
    end
  end

  class PreProcessor < Mutations::Command
    ACTIONS      = ["destroy"]
    RESOURCES    = { # Because I don't trust Kernel.const_get
      "DeviceConfig"          => DeviceConfig,
      "DiagnosticDump"        => DiagnosticDump,
      "FarmEvent"             => FarmEvent,
      "FarmwareInstallations" => FarmwareInstallations,
      "Image"                 => Image,
      "Log"                   => Log,
      "Peripheral"            => Peripheral,
      "PinBinding"            => PinBinding,
      "PlantTemplate"         => PlantTemplate,
      "Point"                 => Point,
      "Regimen"               => Regimen,
      "SavedGarden"           => SavedGarden,
      "SensorReading"         => SensorReading,
      "Sensor"                => Sensor,
      "Sequence"              => Sequence,
      "Tool"                  => Tool,
      "WebcamFeed"            => WebcamFeed,
    }

    DEVICE_REGEX = /device_\d*/

    def self.from_amqp(delivery_info, body)
      # ["bot", "device_3", "resources_v0", "destroy", "Sequence", "2"]
      _, device_name, _, action, resource, resource_id, uuid =  \
        delivery_info.routing_key.split(".")
      run!(device_name: device_name,
          action:      action,
          resource:    resource,
          resource_id: resource_id,
          uuid:        uuid,
          body:        body.empty? ? "{}" : body)
    end

    required do
      string :action,      in:      ACTIONS        # "destroy"
      string :device_name, matches: DEVICE_REGEX   # "device_3"
      string :resource,    in:      RESOURCES.keys # "Sequence"
    end

    optional do
      integer :resource_id, default: 0 # 2
      string  :body                    # "{\"json\":true}"
      string  :uuid, default: "NONE"   # "0dce-1d-41-1d-e95c3b"
    end

    def validate
      maybe_set_device
      maybe_set_body
    end

    def execute
      {
        action:      action.to_sym,
        device:      @device,
        body:        @body,
        resource_id: resource_id,
        resource:    RESOURCES.fetch(resource),
        uuid:        uuid,
      }
    end

    private

    def fail_body
      add_error :body, :body, "body must be a JSON object"
    end

    def maybe_set_body
      hash     = JSON.parse(body)
      fail_body unless hash.is_a?(Hash)
      @body = hash
    rescue JSON::ParserError
      fail_body
    end

    def maybe_set_device
      id      = device_name.gsub("device_", "").to_i
      @device = Device.find_by(id: id)
      add_error :device, :device, "Can't find device ##{id}" unless @device
    end
  end

  class Service
    def self.process(delivery_info, body)
      puts PreProcessor.from_amqp(delivery_info, body)
      puts "Got a resource message, but this is a noop atm."
    end
  end # Service
end # Resources
