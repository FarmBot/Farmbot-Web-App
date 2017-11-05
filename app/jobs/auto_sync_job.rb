class AutoSyncJob < ApplicationJob
  queue_as :default

  def perform(message, id, channel)
    Transport
      .topic
      .publish(message, routing_key: "bot.device_#{id}.#{channel}")
  end
end
