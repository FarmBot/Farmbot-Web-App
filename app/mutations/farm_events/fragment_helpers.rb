module FarmEvents
  module FragmentHelpers
    BAD_MODULE = \
      "The '%s' module cannot use FragmentHelpers"
    def self.included(base); base.extend(ClassMethods); end
    module ClassMethods; end

    def has_body?
      !!body
    end

    def create_fragment_for(owner)
      params    = { device: device,
                    kind:   "internal_farm_event",
                    args:   {},
                    body:   body }
      flat_ast  = Fragments::Preprocessor.run!(params)
      Fragments::Create.run!(device:   device,
                             flat_ast: flat_ast,
                             owner:    owner)
    end

    def wrap_fragment_with(owner)
      return owner unless has_body?
      create_fragment_for(owner)
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
      owner.fragment.destroy! if owner.fragment
    end

    def replace_fragment
      Fragment.transaction do
        destroy_fragment
        create_fragment_for(owner)
      end
    end

    def owner
      module_name = self.class.parent.name
      case module_name
      when "FarmEvents" then farm_event
      when "Regimens"   then regimen
      else;             raise BAD_MODULE % module_name
      end
    end
  end
end
