class AutoSyncJob < ApplicationJob
  queue_as :default

  def perform(broadcast_payload, id, channel, created_at_utc_integer)
    wayback = Time.at(created_at_utc_integer).utc
    mins    = ((wayback - Time.now.utc) / 1.minute).round
    host1 = Transport.connection.host
    host2 = Transport::AMQP_URL
    Rollbar.info("Investigating bad URL", { host1: host1, host2: host2 })
    Transport.amqp_send(broadcast_payload, id, channel) if (mins < 2)
  end
end
