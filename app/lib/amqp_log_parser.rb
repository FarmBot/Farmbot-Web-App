# Data parsing and formatting in `LogService` got too bloated.
# AmqpLogParser is responsible for parsing and extracting data from inbound AMQP
# messages.
# This allows `LogService` to concern itself with transport related logic
# instead of data manipulation and serialization.
class AmqpLogParser < Mutations::Command
  TOO_OLD = "fbos version is out of date"
  DISCARD = "message type field is not the kind that gets saved in the DB"
  NOT_HASH = "logs must be a hash"
  NOT_JSON = "Invalid JSON. Use a JSON validator."
  # I keep a Ruby copy of the JSON here for reference.
  # This is what a log will look like after JSON.parse()
  EXAMPLE_JSON = {
    "channels" => [],
    "created_at" => 1572015955,
    "major_version" => 8,
    "message" => "Syncing",
    "meta" => {},
    "minor_version" => 1,
    "patch_version" => 1,
    "type" => "info",
    "verbosity" => 3,
    "x" => 0.0,
    "y" => 0.0,
    "z" => 0.0,
  }

  required do
    # JSON formatted string. See AmqpLogParser::EXAMPLE_JSON.
    string :payload
    # AMQP channel name. Format: "____.device_12.___"
    string :routing_key
  end

  # A data bucket for storing information after it has been parsed.
  class DeliveryInfo
    attr_accessor :payload,   # Log message as Ruby hash, NOT string / Log class
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
      Device.cached_find(device_id)
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
    @output.payload = JSON.parse(payload)
  rescue JSON::ParserError
    add_error :json, :not_json, NOT_JSON
  end

  def log
    @output.payload
  end

  # Guess the major_version of log message.
  # If neither approach works, returns 0.
  def major_version
    log.fetch("major_version", 0).to_i
  end

  # Weed out anomalies such as logs that are array types.
  def not_hash?
    !log.is_a?(Hash)
  end

  # Determines if the log should be discarded
  # Example: "fun"/"debug" logs do not go in the DB
  def discard?
    type = log.dig("type")
    type.nil? || Log::DISCARD.include?(type)
  end

  def find_problems!
    if not_hash?
      @output.problems.push(NOT_HASH)
      return
    end

    if (major_version || 0) < 7
      @output.problems.push(TOO_OLD)
      return
    end

    if discard?
      @output.problems.push(DISCARD)
      return
    end
  end
end
