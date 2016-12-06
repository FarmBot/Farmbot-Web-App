module Peripherals
  class Create < Mutations::Command
    required do
      model :device, class: Device
      array :peripherals do
        hash do
          required do
            integer :pin
            string  :label
          end
        end
      end
    end

    def execute
      ActiveRecord::Base.transaction do
        device.peripherals.destroy_all
        inputs["peripherals"].each{|p| p[:device] = device; p[:mode] = 0 }
        Peripheral.create!(inputs["peripherals"])
      end
    end
  end
end
