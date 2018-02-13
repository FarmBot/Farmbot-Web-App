module Peripherals
  class Create < Mutations::Command
    required do
      model :device, class: Device
      integer :pin
      string  :label
    end

    def execute
      Peripheral.create!(inputs)
    end
  end
end
