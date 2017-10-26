# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
module Transport
  def self.topic
    @topic ||= Bunny
                 .new(read_timeout: 10, heartbeat: 10)
                 .start
                 .create_channel
                 .topic("amq.topic", auto_delete: true)
  end

  def self.send(message, id, channel)
      topic.publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end
end
