module Steps
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      string :message_type, in: Step::MESSAGE_TYPES
      model :sequence, class: Sequence
      model :command, class: Hash, default: {}
    end

    optional do
      integer :position
    end

    def execute
      create(Step, inputs)
    end
  end
end
