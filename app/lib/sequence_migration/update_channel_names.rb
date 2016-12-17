# This migration adds:
# * adds `message_type` to `send_message` nodes
# * Sets all `channel_name`s to "toast", since that's the only one that survived
#   this migration.
module SequenceMigration
  class UpdateChannelNames < Base
      VERSION = 1
      CREATED_ON = "DECEMBER 15 2016"

      def up
        sequence
            .body
            .select { |x| x["kind"] == "send_message" }
            .each   { |x| x["args"]["message_type"] = "info" }
            .map    { |x| x["body"] }
            .flatten
            .compact
            .select { |x| x["kind"] == "channel" }
            .compact
            .map    { |x| x["args"]["channel_name"] = "toast" }
      end
  end
end