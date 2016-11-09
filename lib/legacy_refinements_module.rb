# This is a REALLY OLD LEGACY MODULE.
# DONT USE IT FOR NEW CODE.
module LegacyRefinementsModule
  refine Mutations::Command do
    
    # IF YOU ARE TRYING TO UNDERSTAND CODE THAT USES THIS MODULE- DONT!!!
    # REWRITE IT INSTEAD. THIS IS A LEGACY MODULE THAT NEEDS TO GO AWAY!!
    def create(klass, inputs = {})
      model = klass.new(inputs)
      yield(model, inputs) if block_given?
      if model.valid? && model.save
        model
      else
        add_error klass.to_s.downcase.to_sym, :invalid, model.errors.messages
        false
      end
    end

    # IF YOU ARE TRYING TO UNDERSTAND CODE THAT USES THIS MODULE- DONT!!!
    # REWRITE IT INSTEAD. THIS IS A LEGACY MODULE THAT NEEDS TO GO AWAY!!
    def update_attributes(model, inputs = {})
      if model.update_attributes(inputs)
        model
      else
        add_error model.class.to_s.downcase.to_sym,
                  :invalid,
                  model.errors.messages
        false
      end
    end
  end
end
