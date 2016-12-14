module Sequences
  class Migrate < Mutations::Command
    required do
      model :device, class: Device
      model :sequence, class: Sequence
    end

    def validate
    end

    def execute
      theirs = sequence.args["version"]
      ours   = Sequence::CURRENT_VERSION
      if theirs == ours
        return sequence
      else
        # CeleryScript::AstNode.new(sequence.body.deep_symbolize_keys)
        SequenceMigration
          .generate_list(sequence)
          .map(&:run)
      end
    end
  end
end
