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

    def validate
      command.each do |k, v|
        unless k.is_a?(String)
          add_error :command,
                    :not_string,
                    "command.#{k} must be a string."
        end
      end
    end

    def execute
      ActiveRecord::Base.transaction do
        position = inputs[:position] || sequence.steps.count
        step = Step.create!(inputs.except(:command).merge(position: position))
        command.map { |k, v| step.step_params.create!(key: k, value: v) }
        # Make sure position is always > 0.
        step
      end
    end
  end
end
