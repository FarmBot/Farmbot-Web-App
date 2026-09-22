module Peripherals
  class Create < Mutations::Command
    required do
      model :device, class: Device
      integer :pin
      string :label
      string :type, in: Peripheral::TYPES
    end

    def execute
      Peripheral.find_or_create_by!(inputs)
    end
  end
end
