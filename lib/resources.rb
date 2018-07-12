module Resources
  DEVICE_REGEX = /device_\d*/
  ACTIONS      = [
    DESTROY = "destroy"
  ]
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

  class Job < Mutations::Command
    required do
      duck    :body, methods: [:[], :[]=]
      duck    :resource, duck: [:where, :find_by]
      integer :resource_id
      model   :device, class: Device
      string  :action, in: ACTIONS
      string  :uuid
    end

    def validate
      # Security critical. Should never occur in production.
      never unless RESOURCES.values.include?(resource)
    end

    def execute
      case action
      when DESTROY then do_deletion
      else; never
      end
    end

    private

    def plural_resource
      @plural_resource ||= resource.name.pluralize
    end

    def do_deletion
      model_name = resource.model_name
      mutation   = Kernel.const_get(model_name.name.pluralize)::Destroy
      mutation.run!(model_name.singular => model, device: device)
    end

    def model
      @model ||= device.send(plural_resource.downcase).find(resource_id)
    end

    # Escape hatch for things that should "never happen".
    def never
      raise "PANIC"
    end
  end # Job

  class Service
    def self.process(delivery_info, body)
      Job.run!(PreProcessor.from_amqp(delivery_info, body))
    rescue Mutations::ValidationException => q
      binding.pry
    end
  end # Service

  class PreProcessor < Mutations::Command
    def self.from_amqp(delivery_info, body)
      # ["bot", "device_3", "resources_v0", "destroy", "Sequence", "2", "123-456
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
        action:      action,
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
  end # PreProcessor
end # Resources
