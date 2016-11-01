module Peripherals
  class Create < Mutations::Command

    required do
      model :device, class: Device
      array :peripherals do
        hash do
          optional do
            integer :mode
          end

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
        inputs["peripherals"].each{|p| p[:device] = device }
        Peripheral.create!(inputs["peripherals"])
      end
    end
  end
end
