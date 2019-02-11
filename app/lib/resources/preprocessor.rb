module Resources
  # Takes a bunch of unsafe, string-y data that came in over AMQP and parses it
  # into fully formed
  class Preprocessor < Mutations::Command
    def self.from_amqp(delivery_info, body)
      # Parse the AMQP rotuing key into an Array of strings.
      # A properly formatted routing_key will look like this after processing:
      #
      # ["bot", "device_3", "resources_v0", "destroy", "Sequence", "2", "xyz"]
      segments = delivery_info.routing_key.split(".")
      _, device_name, _, action, resource, uuid, resource_id = segments
      run!(device_name: device_name,
           action:      action,
           resource:    resource,
           resource_id: resource_id,
           uuid:        uuid,
           body:        body.empty? ? "{}" : body)
    end

    required do
      string :action,      in:      ACTIONS            # "destroy"
      string :device_name, matches: DEVICE_REGEX       # "device_3"
                                    # "Sequence":
      string :resource,    in:      ELIGIBLE_RESOURCES.map(&:to_s)
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
  end # Preprocessor
end # Resources
