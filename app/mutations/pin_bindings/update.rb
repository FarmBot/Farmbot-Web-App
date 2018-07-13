module PinBindings
  class Update < Mutations::Command
    include PinBindings::Helpers

    required do
      model   :pin_binding, class: PinBinding
      model   :device,      class: Device
    end

    optional do
      string  :special_action, in: PinBinding.special_actions.values
      integer :sequence_id
      integer :pin_num
    end

    def validate
      not_both_actions
      validate_sequence_id if sequence_id
    end

    def execute
      x = inputs.except(:pin_binding, :device)
      pin_binding.update_attributes!(x) && pin_binding
    end
  end
end
