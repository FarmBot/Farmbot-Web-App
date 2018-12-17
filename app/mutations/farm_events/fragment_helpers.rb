module FarmEvents
  module FragmentHelpers
    def self.included(base); base.extend(ClassMethods); end
    module ClassMethods; end

    def has_body?
      !!body
    end

    def create_fragment(kind = "internal_farm_event", args = {})
      return nil unless has_body?
      if @fragment
        @fragment
      else
        flat_ast  = Fragments::Preprocessor.run!(device: device,
                                                 kind:   kind,
                                                 args:   {},
                                                 body:   body)
        @fragment = Fragments::Create.run!(device: device, flat_ast: flat_ast)
      end
    end
  end
end
