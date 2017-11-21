# This migration adds:
# * adds `message_type` to `send_message` nodes
# * Sets all `channel_name`s to "toast", since that's the only one that survived
#   this migration.
module SequenceMigration
  class SequenceSpeedChange < Base
      VERSION    = 5
      CREATED_ON = "NOVEMBER 21 2017"
      MUST_BE_100 = [ "move_absolute",
                      "move_relative",
                      "home",
                      "find_home" ]

      def up
        raise "Make all the speed values === 100"
      end
  end
end
