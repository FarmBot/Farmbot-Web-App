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
      step = Step.new(inputs)
      # Make sure position is always > 0.
      step.position ||= step.sequence.steps.count

      if step.valid? && step.save
        return step
      else
        add_error :step, :invalid, step.errors.messages
      end
    end
  end
end
