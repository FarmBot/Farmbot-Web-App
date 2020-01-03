module FarmEvents
  module FragmentHelpers
    BAD_MODULE = "The '%s' module cannot use FragmentHelpers"
    TRANSACTION_REQUIRED = "A database transaction is required to do this."
    def self.included(base); base.extend(ClassMethods); end

    module ClassMethods; end

    def has_body?
      !!body
    end

    def create_fragment_for(owner)
      kind = owner.class.name.tableize.singularize
      params = { device: device,
                 kind: "internal_#{kind}",
                 args: {},
                 body: body }
      flat_ast = Fragments::Preprocessor.run!(**params)
      Fragments::Create.run!(device: device,
                             flat_ast: flat_ast,
                             owner: owner)
    end

    def wrap_fragment_with(owner)
      return owner unless has_body?
      if ActiveRecord::Base.connection.open_transactions.zero?
        raise TRANSACTION_REQUIRED
      end
      create_fragment_for(owner)
      owner.manually_sync!
    end

    def handle_body_field
      case body
      when nil then return
      when [] then destroy_fragment
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
      options = {
        FarmEvents => ->() { farm_event },
        Regimens => ->() { regimen },
      }
      options.fetch(self.class.module_parent).call()
    end
  end
end
