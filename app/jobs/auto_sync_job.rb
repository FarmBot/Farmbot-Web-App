class AutoSyncJob < ApplicationJob
  queue_as :default

  def perform(broadcast_payload, id, channel, created_at_utc_integer)
    wayback = Time.at(created_at_utc_integer).utc
    mins    = ((wayback - Time.now.utc) / 1.minute).round

    Transport.current.amqp_send(broadcast_payload, id, channel) if (mins < 2)
  end
end
