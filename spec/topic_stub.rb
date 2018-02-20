# Fake RabbitMQ adapter for when we test things.
class TopicStub
  def self.publish(msg, opts)
  end
end

class ChannelStub
  def self.topic(name, opts)
    return TopicStub
  end
end

class MQTTStub
  def self.create_channel
    return ChannelStub
  end
end

def Transport.connection
  return MQTTStub
end
