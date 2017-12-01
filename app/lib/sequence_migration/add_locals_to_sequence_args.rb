# This migration:
#   Adds a `locals` arg to all v5 or better sequences.
module SequenceMigration
  class AddLocalsToSequenceArgs < Base
      VERSION     = 6
      CREATED_ON  = "NOVEMBER 30 2017"

      def up
        binding.pry
        sequence.args["locals"] ||= Sequence::NOTHING
      end
  end
end
