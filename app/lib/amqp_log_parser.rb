# Data parsing and formatting in `LogService` got too bloated.
# AmqpLogParser is responsible for parsing and extracting data from inbound AMQP
# messages.
# This allows `LogService` to concern itself with transport related logic
# instead of data manipulation and serialization.
class AmqpLogParser < Mutations::Command
  TOO_OLD  = "fbos version is out of date"
  DISCARD  = "message type field is not the kind that gets saved in the DB"
  NOT_HASH = "logs must be a hash"

  # I keep a Ruby copy of the JSON here for reference.
  # This is what a log will look like after JSON.parse()
  EXAMPLE_JSON = {
    "meta" => {
      "x"             => 0,
      "y"             => 0,
      "z"             => 0,
      "type"          => "info"
    },
    "major_version" => 6,        # <=  up-to-date bots do this
    "message"       => "HQ FarmBot TEST 123 Pin 13 is 0",
    "created_at"    => 1512585641,
    "channels"      => []
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

    # Prevents "runaway" bots from flooding the server with frivoulous database
    # hits by using in memory cache of results for 150 seconds.
    def device
      Rails
        .cache
        .fetch("devices##{device_id}", expires_in: 150.seconds) do
          Device.find(device_id)
        end
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
  end

  def log
    @output.payload
  end

  # Guess the major_version of log message. Handles legacy vs. mainline FBOS
  # versions. If neither approach works, returns 0.
  def major_version
    # `log.major_version` is the preferred place to store version data.
    # Legacy bots put the version info within `log.meta.major_version`.
    (log["major_version"] || log.dig("meta", "major_version") || 0).to_i
  end

  # Weed out anamolies such as logs that are array types.
  def not_hash?
    !log.is_a?(Hash)
  end

  # Determines if the log should be discarded
  # Example: "fun"/"debug" logs do not go in the DB
  def discard?
    # Handles new logs as well as legacy logs where type is stored in
    # log.meta.type.
    type = log.dig("type") || log.dig("meta", "type")
    type.nil? || Log::DISCARD.include?(type)
  end

  def find_problems!
    @output.problems.push(NOT_HASH) and return if not_hash?
    @output.problems.push(TOO_OLD)  and return if major_version < 6
    @output.problems.push(DISCARD)  and return if discard?
  end
end
