# Meteor.JS on a budget. When a model changes on the API, we queue a background
# job to tell browsers and bots about it so they can update their data in
# realtime. See: ApplicationRecord.
class AutoSyncJob < ApplicationJob
  queue_as :default

  def perform(broadcast_payload, id, channel, created_at_utc_integer)
    wayback = Time.at(created_at_utc_integer).utc
    mins    = ((wayback - Time.now.utc) / 1.minute).round

    Transport.current.amqp_send(broadcast_payload, id, channel) if (mins < 2)
  end
end
