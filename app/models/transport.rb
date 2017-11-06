require "bunny"
# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
module Transport
  LOCAL    = "amqp://guest:guest@localhost:5672"
  AMQP_URL = ENV['CLOUDAMQP_URL'] || ENV['RABBITMQ_URL'] || LOCAL
  OPTS     = { read_timeout: 10, heartbeat: 10, log_level: 'info' }

  def self.connection
    @connection ||= Bunny.new(AMQP_URL, OPTS).start
  end

  def self.topic
    @topic ||= self
                 .connection
                 .create_channel
                 .topic("amq.topic", auto_delete: true)
  end

  def self.amqp_send(message, id, channel)
    topic.publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end
end
