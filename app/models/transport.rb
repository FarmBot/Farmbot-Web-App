# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
module Transport
  def self.send(message, id, channel)
    Bunny
      .new
      .start
      .create_channel
      .topic("amq.topic", auto_delete: true)
      .publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end
end
