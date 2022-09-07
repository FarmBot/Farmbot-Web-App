# similar to AmqpLogParser
class AmqpTelemetryParser < Mutations::Command
  DISCARD = "not saved in the DB"
  NOT_HASH = "telemetry must be a hash"
  NOT_JSON = "Invalid JSON. Use a JSON validator."
  # Copy of the JSON for reference.
  # This is what telemetry will look like after JSON.parse()
  EXAMPLE_JSON = {
    "soc_temp" => 100,
    "throttled" => "0x0",
    "wifi_level_percent" => 80,
    "uptime" => 12345,
    "memory_usage" => 100,
    "disk_usage" => 1,
    "cpu_usage" => 1,
    "target" => "rpi"
  }

  required do
    # JSON formatted string. See AmqpTelemetryParser::EXAMPLE_JSON.
    string :payload
    # AMQP channel name. Format: "____.device_12.___"
    string :routing_key
  end

  # A data bucket for storing information after it has been parsed.
  class DeliveryInfo
    attr_accessor :payload,   # Telemetry message as Ruby hash, NOT string / Telemetry class
                  :device_id, # Integer
                  :problems,  # String[] - Let's you know *why* it's invalid.
                  :device     # Device

    def initialize
      @problems = []
    end

    def valid?
      !problems.present?
    end

    # Prevents "runaway" bots from flooding the server with frivolous database
    # hits by using in memory cache of results for 150 seconds.
    def device
      Device.find(device_id)
    end
  end

  def validate
    @output = DeliveryInfo.new
    set_device_id!
    set_payload!
    find_problems!
  end

  def execute
    @output
  end

  private

  def set_device_id!
    @output.device_id = routing_key
      .split(".")[1]
      .gsub("device_", "")
      .to_i
  end

  def set_payload!
    # Parse from string to a Ruby hash (JSON)
    j = JSON.parse(payload)
    @output.payload = {
      "soc_temp" => j["telemetry_soc_temp"],
      "throttled" => j["telemetry_throttled"],
      "wifi_level_percent" => j["telemetry_wifi_level_percent"],
      "uptime" => j["telemetry_uptime"],
      "memory_usage" => j["telemetry_memory_usage"],
      "disk_usage" => j["telemetry_disk_usage"],
      "cpu_usage" => j["telemetry_cpu_usage"],
      "target" => j["telemetry_target"],
    }
  rescue JSON::ParserError
    add_error :json, :not_json, NOT_JSON
  end

  def telemetry
    @output.payload
  end

  # Weed out anomalies such as telemetry that are array types.
  def not_hash?
    !telemetry.is_a?(Hash)
  end

  # Determines if the telemetry should be discarded
  def discard?
    target = telemetry.dig("target")
    target.nil? || [nil].include?(target)
  end

  def find_problems!
    if not_hash?
      @output.problems.push(NOT_HASH)
      return
    end

    if discard?
      @output.problems.push(DISCARD)
      return
    end
  end
end
