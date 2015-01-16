module Steps
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      string :message_type, in: Step::MESSAGE_TYPES
      model :sequence, class: Sequence
      hash :command do
        model :*, class: Object
      end
    end

    def execute
      create(Step, inputs)
    end
  end
end
