require "bunny"

# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
class Transport
  OPTS = { read_timeout: 10, heartbeat: 10, log_level: "warn" }
  CLOUDAMQP_ENV_KEY = ENV.fetch("WHERE_IS_CLOUDAMQP_URL", "CLOUDAMQP_URL")

  def self.amqp_url
    @amqp_url ||= ENV[CLOUDAMQP_ENV_KEY] ||
                  ENV["RABBITMQ_URL"] ||
                  "amqp://admin:#{ENV.fetch("ADMIN_PASSWORD")}@mqtt:5672"
  end

  def self.default_amqp_adapter=(value)
    @default_amqp_adapter = value
  end

  def self.default_amqp_adapter
    @default_amqp_adapter ||= Bunny
  end

  attr_accessor :amqp_adapter, :request_store

  def self.current
    @current ||= self.new
  end

  def self.current=(value)
    @current = value
  end

  def connection
    @connection ||= Transport
      .default_amqp_adapter.new(Transport.amqp_url, OPTS).start
  end

  def log_channel
    @log_channel ||= self.connection
                         .create_channel
                         .queue("api_log_workers")
                         .bind("amq.topic", routing_key: "bot.*.logs")
  end

  def telemetry_channel
    @telemetry_channel ||= self
      .connection
      .create_channel
      .queue("api_telemetry_workers")
      .bind("amq.topic", routing_key: "bot.*.telemetry")
  end

  def amqp_topic
    @amqp_topic ||= self
      .connection
      .create_channel
      .topic("amq.topic", auto_delete: true)
  end

  def send_demo_token_to(user, secret)
    fbos_version = Api::AbstractController::EXPECTED_VER
    routing_key =
      [Api::RmqUtilsController::DEMO_REGISTRY_ROOT, secret].join(".")
    payload =
      SessionToken.as_json(user, "GUEST", fbos_version).to_json
    raw_amqp_send(payload, routing_key)
  end

  def amqp_send(message, id, channel)
    raise "BAD `id`" unless id.is_a?(String) || id.is_a?(Integer)
    routing_key = "bot.device_#{id}.#{channel}"
    raw_amqp_send(message, routing_key)
  end

  def raw_amqp_send(message, routing_key)
    puts message if Rails.env.production?
    amqp_topic.publish(message, routing_key: routing_key)
  end

  # We need to hoist the Rack X-Farmbot-Rpc-Id to a global state so that it can
  # be used as a unique identifier for AMQP messages.
  def current_request_id
    RequestStore.store[:current_request_id] || "NONE"
  end

  def set_current_request_id(uuid)
    RequestStore.store[:current_request_id] = uuid
  end

  module Mgmt
    require "rabbitmq/http/client"

    def self.username
      @username ||= URI(Transport.amqp_url).user || "admin"
    end

    def self.password
      @password ||= URI(Transport.amqp_url).password
    end

    def self.api_url
      uri = URI(Transport.amqp_url)
      uri.scheme = ENV["FORCE_SSL"] ? "https" : "http"
      uri.user = nil
      uri.port = 15672
      uri.to_s
    end

    def self.client
      @client ||= RabbitMQ::HTTP::Client.new(ENV["RABBIT_MGMT_URL"] || api_url,
                                             username: self.username,
                                             password: self.password)
    end

    def self.connections
      client.list_connections
    end

    def self.find_connection_by_name(name)
      connections
        .select { |x| x.fetch("user").include?(name) }
        .pluck("name")
        .compact
        .uniq
    end

    def self.close_connections_for_username(name)
      find_connection_by_name(name).map { |connect| client.close_connection(connect) }
    end
  end # Mqmt
end # Transport
