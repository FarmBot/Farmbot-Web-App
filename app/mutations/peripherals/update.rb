module Peripherals
  class Update < Mutations::Command
    required do
      model :peripheral, class: Peripheral
      model :device, class: Device
    end

    optional do
      integer :pin
      string  :label
    end

    def execute
      peripheral.update_attributes!(inputs.except(:peripheral, :device))
      peripheral
    end
  end
end
