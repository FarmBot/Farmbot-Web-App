module Steps
  class Create < Mutations::Command

    required do
      string :message_type, in: Step::MESSAGE_TYPES
      hash(:command) { model :*, class: Object }
      model :sequence
    end

    def execute
      create(Step, inputs)
    end

    # TODO: Move this into a refinement
    # This method provides a uniform way of
    # 1. Creating models inside of Mutations
    # 2. presenting API model validation errors unifromly.
    # This is important for keeping API msgs sane.
    # Returns an instance of Klass -OR- a hash of model validation err. messages
    # You may optionally pass in a block to transform the model / input
    # before it gets saved.
    # Ex: create(User, name: 'Rick', email: "r@mailinator.com") do |user, inputs|
    #       inputs.email.downcase!
    #       user.password = "SomethingThatYouPassIn"
    #     end
    def create(klass, inputs = {})
      binding.pry
      model = klass.new(inputs)
      yield(model, inputs) if block_given?
      if (model.valid? && model.save)
        model
      else
        model.errors.messages
      end
    end
  end
end
