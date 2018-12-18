module FarmEvents
  module FragmentHelpers
    def self.included(base); base.extend(ClassMethods); end
    module ClassMethods; end

    def has_body?
      !!body
    end

    def wrap_fragment_with(owner)
      return owner unless has_body?
      params    = { device: device,
                    kind:   "internal_farm_event",
                    args:   {},
                    body:   body }
      flat_ast  = Fragments::Preprocessor.run!(params)
      Fragments::Create.run!(device: device, flat_ast: flat_ast, owner: owner)
      owner
    end

    def handle_body_field
      case body
      when nil then return
      when []  then destroy_fragment
      else
        replace_fragment
      end
    end

    def destroy_fragment
      farm_event.fragment.destroy! if farm_event.fragment
    end

    def replace_fragment
      Fragment.transaction do
        raise "Not implemented"
      end
    end
  end
end
