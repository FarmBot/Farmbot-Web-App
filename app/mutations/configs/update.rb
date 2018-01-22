module Configs
  class Update < Mutations::Command
    required do
      duck :target_klass, methods: [:update_attributes!]
      duck :update_attrs, methods: [:deep_symbolize_keys]
    end

    def execute
      target_klass.update_attributes!(sliced_attrs)
      target_klass
    end

    def sliced_attrs
      whitelist = target_klass.class.column_names.map(&:to_sym)
      updates   = update_attrs.deep_symbolize_keys.except(:device_id)
      updates.slice(*whitelist)
    end
  end
end
