require "bunny"
# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
class Transport
  LOCAL    = "amqp://guest:guest@localhost:5672"
  AMQP_URL = ENV['CLOUDAMQP_URL'] || ENV['RABBITMQ_URL'] || LOCAL
  OPTS     = { read_timeout: 10, heartbeat: 10, log_level: 'info' }

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
    @connection ||= Transport.default_amqp_adapter.new(AMQP_URL, OPTS).start
  end

  def log_channel
    @log_channel ||=  self.connection
                          .create_channel
                          .queue("", exclusive: true)
                          .bind("amq.topic", routing_key: "bot.*.logs")
  end

  def amqp_topic
    @topic ||= self
                  .connection
                  .create_channel
                  .topic("amq.topic", auto_delete: true)
  end

  def amqp_send(message, id, channel)
    topic.publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end

  # We need to hoist the Rack X-Farmbot-Rpc-Id to a global state so that it can
  # be used as a unique identifier for AMQP messages.
  def current_request_id
    RequestStore.store[:current_request_id] || "NONE"
  end

  def set_current_request_id(uuid)
    RequestStore.store[:current_request_id] = uuid
  end
end
