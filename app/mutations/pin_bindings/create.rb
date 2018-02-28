module PinBindings
  class Create < Mutations::Command
    include PinBindings::Helpers

    required do
      model   :device, class: Device
      integer :sequence_id
      integer :pin_num
    end

    def validate
      validate_sequence_id
    end

    def execute
      PinBinding.create!(inputs)
    end
  end
end
