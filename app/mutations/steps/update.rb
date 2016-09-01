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
      update_attributes(step, step_params)
      step.reload
    end
  end
end
