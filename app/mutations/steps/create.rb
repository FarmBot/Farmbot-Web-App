module Steps
  class Create < Mutations::Command
    using MongoidRefinements

    required do
      string :message_type, in: Step::MESSAGE_TYPES
      hash(:command) { model :*, class: Object }
      model :sequence
    end

    def execute
      create(Step, inputs)
    end
  end
end
