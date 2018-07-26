module PinBindings
  class Create < Mutations::Command
    include PinBindings::Helpers

    required do
      model   :device, class: Device
      integer :pin_num
    end

    optional do
      integer :sequence_id
      string  :special_action, in: PinBinding.special_actions.values
    end

    def validate
      validate_pin_num
      validate_sequence_id
      exactly_one_choice
      not_both_actions
    end

    def execute
      PinBinding.create!(inputs)
    end
  end
end
