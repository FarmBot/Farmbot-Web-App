# A wrapper around AMQP to stay DRY. Will make life easier if we ever need to
# change protocols
module Transport

  AMQP_URL     = ENV['CLOUDAMQP_URL'] ||
                 ENV['RABBITMQ_URL']  ||
                 "amqp://guest:guest@localhost:5672"

  AMQP_OPTIONS = { read_timeout: 10,
                   heartbeat:    10,
                   log_level:    'info' }

  def self.connection
    @connection ||= Bunny.new(AMQP_URL, AMQP_OPTIONS).start
  end

  def self.topic
    @topic ||= self
                 .connection
                 .create_channel
                 .topic("amq.topic", auto_delete: true)
  end

  def self.send(message, id, channel)
    AutoSyncJob.perform_later(message, id, channel)
  end
end
