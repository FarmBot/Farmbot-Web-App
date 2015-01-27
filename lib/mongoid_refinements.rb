# A set of refinements that help the mutations gem deal with Mongoid
module MongoidRefinements
  refine Mutations::Command do
    # This method provides a uniform way of ==================================
    # 1. Creating models inside of Mutations
    # 2. presenting API model validation errors unifromly.
    # This is important for keeping API msgs sane.
    # Returns an instance of Klass -OR- a hash of model validation err.
    # messages You may optionally pass in a block to transform the model/input
    # before it gets saved.
    # Ex: create(User, name: 'Rick', email: "r@m.com") do |user, inputs|
    #       inputs.email.downcase!
    #       user.password = "SomethingThatYouPassIn"
    #     end # ==============================================================
    def create(klass, inputs = {})
      model = klass.new(inputs)
      yield(model, inputs) if block_given? && model.valid?
      if model.valid? && model.save
        model
      else
        add_error klass.to_s.downcase.to_sym, :invalid, model.errors.messages
      end
    end

    # See documentation for `create()`. Does the same thing, except for updates.
    def update_attributes(model, inputs = {})
      if model.update_attributes(inputs)
        model
      else
        # TODO test this
        add_error klass.to_s.downcase.to_sym, :invalid, model.errors.messages
      end
    end
  end
end
