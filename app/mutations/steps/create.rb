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
      # Put the step on the end if position is not specified.
      inputs[:position] ||= sequence.steps.count + 1
      step = create(Step, inputs.except(:position))
      if step
        # The library acts funny if you try to set position using `position=`
        step.move_to!(inputs[:position])
        step
      end
    end
  end
end
