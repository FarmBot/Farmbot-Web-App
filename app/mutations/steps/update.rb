module Steps
  class Update < Mutations::Command
    using MongoidRefinements

    required do
      model :step, class: Step
      hash :step_params do
        optional do
          integer :position
          string :message_type, in: Step::MESSAGE_TYPES
          hash :command do
            model :*, class: Object
          end
        end
      end
    end

    def execute
      # FIXME: Right now, we do almost 0 validation on command objects.
      # There are 7 different command types, with different validation rules.
      # Maybe:
      #    1. Create a StepValidatorFactory
      #    2. Create a SingleCommandValidator, ReadStatusValidator, etc.
      # Or: Use inheritance and embed different classes of Command

      # TODO move_to is possibly broke. Going to reorder on every request to stay in sync?
      step.move_to! step_params[:position] if step_params[:position]
      update_attributes(step, step_params.except(:position))
      step.reload
    end
  end
end
