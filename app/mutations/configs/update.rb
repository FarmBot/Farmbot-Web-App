module Configs
  class Update < Mutations::Command
    required do
      duck :target_klass, methods: []
      duck :update_attrs, methods: [:[], :[]=]
    end

    def execute
      target_klass
        .update_attributes!(update_attrs.deep_symbolize_keys.except(:device_id))
      target_klass
    end
  end
end
