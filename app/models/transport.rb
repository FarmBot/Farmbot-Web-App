# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
module Transport

  AMQP_URL = ENV['CLOUDAMQP_URL'] ||
             ENV['RABBITMQ_URL']  ||
             "amqp://guest:guest@localhost:5672"

  def self.connection
    @connection ||= Bunny.new(AMQP_URL, read_timeout: 10, heartbeat: 10).start
  end

  def self.topic
    @topic ||= self
                 .connection
                 .create_channel
                 .topic("amq.topic", auto_delete: true)
  end

  def self.send(message, id, channel)
      topic.publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end
end
