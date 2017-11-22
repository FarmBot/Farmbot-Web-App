# This migration:
#   Changes the `speed` setting of all v4 sequence to 100 in anticipation of new
#   movement parameter semantics.
module SequenceMigration
  class SequenceSpeedChange < Base
      VERSION     = 5
      CREATED_ON  = "NOVEMBER 21 2017"
      MUST_BE_100 = [ "move_absolute",
                      "move_relative",
                      "home",
                      "find_home" ]

      def up
        CeleryScript::TreeClimber.travel(sequence.body, ->(n) {
          binding.pry
        })
      end
  end
end
